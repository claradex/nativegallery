'use client';

import { CheckCircle2, CircleAlert, Copy, ExternalLink, Loader2, LogIn, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { GoogleDevicePoll, GoogleDeviceStart } from '@nativegallery/contracts';
import { refreshPage } from '../../../components/navigation';
import { RequestError, send } from '../lib/request';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

type State =
  | { phase: 'starting' }
  | { phase: 'waiting'; code: GoogleDeviceStart }
  | { phase: 'connected'; account: string }
  | { phase: 'failed'; message: string };

/**
 * Sign-in with a code: shows the code Google gave, links to Google's page for it and asks the API every few seconds
 * whether the owner has allowed access. Starts as soon as it is shown.
 */
export function GoogleDevicePanel({ targetId, onConnected }: { targetId: number; onConnected?: (account: string) => void }) {
  const [state, setState] = useState<State>({ phase: 'starting' });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Only the latest request for a code counts: an earlier one's code was already replaced on the server. */
  const attempt = useRef(0);
  const connected = useRef(onConnected);
  useEffect(() => { connected.current = onConnected; }, [onConnected]);
  const url = '/api/admin/storage/' + targetId + '/google/device';

  const start = useCallback(async () => {
    clearTimeout(timer.current);
    const current = ++attempt.current;
    setState({ phase: 'starting' });
    try {
      const code = await send<GoogleDeviceStart>(url, { fallback: 'Google не выдал код.' });
      if (current === attempt.current) setState({ phase: 'waiting', code });
    } catch (error) {
      if (current === attempt.current) setState({ phase: 'failed', message: error instanceof RequestError ? error.message : 'Google не выдал код.' });
    }
  }, [url]);

  useEffect(() => { void start(); return () => clearTimeout(timer.current); }, [start]);

  useEffect(() => {
    if (state.phase !== 'waiting') return;
    const { handle, interval } = state.code;
    let stopped = false;
    const poll = async () => {
      let reply: GoogleDevicePoll;
      try {
        reply = await send<GoogleDevicePoll>(url + '/poll', { body: { handle }, fallback: 'Не удалось узнать, подтверждён ли вход.' });
      } catch (error) {
        reply = { status: 'error', message: error instanceof Error ? error.message : undefined };
      }
      if (stopped) return;
      if (reply.status === 'pending') { timer.current = setTimeout(poll, Math.max(interval, 3) * 1000); return; }
      if (reply.status === 'connected') {
        setState({ phase: 'connected', account: reply.account ?? '' });
        toast.success('Google Drive подключён' + (reply.account ? ': ' + reply.account : ''));
        refreshPage();
        connected.current?.(reply.account ?? '');
        return;
      }
      setState({ phase: 'failed', message: reply.message ?? 'Не удалось подключить Google.' });
    };
    timer.current = setTimeout(poll, Math.max(interval, 3) * 1000);
    return () => { stopped = true; clearTimeout(timer.current); };
  }, [state, url]);

  if (state.phase === 'starting') {
    return <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Получаем код у Google…</p>;
  }
  if (state.phase === 'connected') {
    return <p className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2.5 text-sm text-success">
      <CheckCircle2 className="size-4 shrink-0" />Подключён{state.account && <> аккаунт <b>{state.account}</b></>}. Файлы начнут публиковаться в фоне.
    </p>;
  }
  if (state.phase === 'failed') {
    return <div className="grid gap-3">
      <p className="flex items-start gap-2 rounded-md bg-destructive/8 px-3 py-2.5 text-[13px] break-words text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" />{state.message}
      </p>
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={start}><RefreshCw />Получить новый код</Button>
    </div>;
  }
  const { userCode, verificationUrl } = state.code;
  return <div className="grid gap-4">
    <ol className="grid list-decimal gap-1.5 pl-5 text-sm">
      <li>Откройте <a href={verificationUrl} target="_blank" rel="noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
        {verificationUrl.replace(/^https?:\/\/(www\.)?/, '')}<ExternalLink className="ml-0.5 inline size-3.5 align-[-2px]" /></a> — можно на телефоне.</li>
      <li>Войдите в аккаунт Google, где будут храниться копии, и введите код:</li>
    </ol>
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/40 py-4">
      <span className="font-mono text-3xl font-semibold tracking-[0.2em] select-all">{userCode}</span>
      <Button type="button" variant="ghost" size="icon-sm" aria-label="Скопировать код"
        onClick={() => navigator.clipboard.writeText(userCode).then(() => toast.success('Код скопирован'), () => toast.error('Не удалось скопировать'))}>
        <Copy /></Button>
    </div>
    <p className="text-[13px] text-muted-foreground">3. Разрешите доступ. Сайт увидит только файлы, которые создаст сам — в папке NativeGallery вашего Диска.</p>
    <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><Loader2 className="size-3.5 animate-spin" />Ждём подтверждения…</p>
  </div>;
}

/** The code sign-in in its own dialog, for a storage that already exists (the card's «Подключить»). */
export function GoogleDeviceDialog({ targetId, trigger }: { targetId: number; trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>{trigger ?? <Button size="sm"><LogIn />Подключить Google Drive</Button>}</DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Подключение Google Drive</DialogTitle>
        <DialogDescription>Вход по коду: Client ID и настройка Google Cloud не нужны.</DialogDescription>
      </DialogHeader>
      {open && <GoogleDevicePanel targetId={targetId} onConnected={() => setTimeout(() => setOpen(false), 1500)} />}
    </DialogContent>
  </Dialog>;
}

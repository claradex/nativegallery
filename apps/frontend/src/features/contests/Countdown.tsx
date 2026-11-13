'use client';

import { useEffect, useState } from 'react';

const units = [
  [86400, 'день', 'дня', 'дней'],
  [3600, 'час', 'часа', 'часов'],
  [60, 'минута', 'минуты', 'минут'],
  [1, 'секунда', 'секунды', 'секунд'],
] as const;

function countdownText(seconds: number) {
  return units.map(([size, singular, few, many]) => {
    const count = Math.floor(seconds / size);
    seconds %= size;
    const last = count % 10;
    const lastTwo = count % 100;
    const word = last === 1 && lastTwo !== 11 ? singular
      : last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20) ? few : many;
    return String(count).padStart(2, '0') + ' ' + word;
  }).join(' ');
}

export function Countdown({ until, as: Tag }: { until: number; as: 'b' | 'h1' }) {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    let timer: number;
    function tick() {
      const remaining = Math.max(0, until - Math.floor(Date.now() / 1000));
      setSeconds(remaining);
      if (remaining > 0) timer = window.setTimeout(tick, 1000);
    }
    tick();
    return () => window.clearTimeout(timer);
  }, [until]);

  return <Tag id="countdown">{seconds === null ? '' : countdownText(seconds)}</Tag>;
}

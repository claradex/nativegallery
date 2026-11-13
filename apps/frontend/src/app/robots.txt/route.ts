export async function GET(request: Request) {
  const hostname = process.env.SITE_ORIGIN ? new URL(process.env.SITE_ORIGIN).hostname : new URL(request.url).hostname;
  return new Response('User-Agent: *\nDisallow: /lk/\nClean-Param: vid&gid&upd /photo/\nHost: https://' + hostname, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

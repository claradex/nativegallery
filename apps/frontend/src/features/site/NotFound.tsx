import { renderToStaticMarkup } from 'react-dom/server';

const styles = `
@import url("https://rsms.me/inter/inter.css");
    body {
        font-family: Inter !important;
    }
	#tracy-error { all: initial; position: absolute; top: 0; left: 0; right: 0; height: 70vh; min-height: 400px; display: flex; align-items: center; justify-content: center; z-index: 1000 }
	#tracy-error div { all: initial; max-width: 550px; background: white; color: #333; display: block }
	#tracy-error h1 { all: initial; font-family: Inter !important; font-size: 50px; font-weight: 700; display: block; margin: 40px }
	#tracy-error p { all: initial; font-family: Inter !important; margin: 40px; display: block }
    #tracy-error pre { all: initial; font-family: Inter !important; margin: 40px; display: block }
	#tracy-error small { color: gray }
	#tracy-error small span { color: silver }
`;

export function NotFound(request: Request) {
  const url = new URL(request.url);
  const html = renderToStaticMarkup(<html lang="en">
    <head><meta charSet="utf-8" /><meta name="robots" content="noindex" /><title>Server Error</title><style>{styles}</style></head>
    <body><div id="tracy-error"><div>
      <h1>Not Found</h1>
      <p>The requested page not found on server.</p><br />
      <pre>{url.pathname + url.search}</pre>
    </div></div></body>
  </html>);
  return new Response(html.startsWith('<!DOCTYPE') ? html : '<!DOCTYPE html>' + html, {
    status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

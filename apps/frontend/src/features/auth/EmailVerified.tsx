import { renderToStaticMarkup } from '../../components/RenderMarkup';

export function EmailVerified() {
  const content = renderToStaticMarkup(<tr><td className="main">
    <h1>Спасибо, ваша почта подтверждена.</h1>
  </td></tr>);
  return '<!DOCTYPE html><html lang="ru"><head>__HEAD__</head><body><div id="backgr"></div><table class="tmain">__NAVBAR__' +
    content + '<tr>__FOOTER__</tr></table></body></html>';
}

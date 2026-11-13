const progressStyles = `
.progress-container {
  width: 100%;
  background:linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)) var(--theme-bg-color);
  height: 5px;
  display: block;
}

@media screen and (max-width: 768px) {
  :root {
    --bckgr: -1500px 0;
    --bckgr2: 1500px 0;
  }
}

@media screen and (min-width: 768px) {
  :root {
    --bckgr: -3500px 0;
    --bckgr2: 3500px 0;
  }
}

@-webkit-keyframes bg-move {
  0%   { background-position: var(--bckgr); }
  100% { background-position: var(--bckgr2); }
}
@keyframes bg-move {
  0%   { background-position: var(--bckgr); }
  100% { background-position: var(--bckgr2); }
}

.progress-bard {
  background-color: #fff;
  width: 0%;
  display: block;
  height: inherit;
  transition: width 0.6s ease;
  background-image: linear-gradient(270deg, rgba(100, 181, 239, 0) 48.44%,  var(--theme-bg-hover-color) 75.52%, rgba(100, 181, 239, 0) 100%);
  background-repeat: no-repeat;
  animation: bg-move linear 2s infinite;
}
`;

export function LoadHead({ title, cookie }: { title: string; cookie: string | null }) {
  const cache = process.env.CLOUDFLARE_CACHING === 'true' ? '?' + Math.floor(Date.now() / 1000) : '';
  const darkTheme = /(?:^|;\s*)NGALLERYTHEME=nativegallery-dark(?:;|$)/.test(cookie ?? '');
  return <>
    <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@400;700&amp;display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/static/css/fontawesome/css/all.min.css" />
    <link rel="stylesheet" href={'/static/css/style.css' + cache} />
    <link rel="stylesheet" href={'/static/css/desktop.css' + cache} />
    <link rel="stylesheet" href={'/static/css/trans.css' + cache} />
    <link rel="stylesheet" href={'/static/css/photo.css' + cache} />
    <link rel="stylesheet" href={'/static/css/notie.css' + cache} />
    <link rel="stylesheet" href={'/static/css/comments.css' + cache} />
    {darkTheme && <link rel="stylesheet" href="/static/themepacks/nativegallery-dark/root.css" />}
    <link rel="stylesheet" href={'/static/css/map.css' + cache} />
    <link rel="stylesheet" href={'/static/css/jquery-ui-1.8.20.custom.css' + cache} />
    {'__SCRIPT_ContestCountdown__'}
    <script src={'/static/js/notie.js' + cache} data-restart></script>
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css" />
    <div className="progress-container fixed-top">
      <span className="progress-bard"></span>
    </div>
    <style>{progressStyles}</style>
    {'__SCRIPT_Head__'}
    {'__SCRIPT_Navigation__'}
  </>;
}

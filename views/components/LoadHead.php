<meta http-equiv="content-type" content="text/html;charset=UTF-8">
    <meta name="viewport" content="width=1000,user-scalable=yes">
    <title><?=NGALLERY['root']['title']?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@400;700&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/static/css/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="/static/css/style.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/desktop.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/trans.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/photo.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/notie.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/comments.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <link rel="stylesheet" href="/static/css/map.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>">
    <script src="/static/js/jquery.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/jquery-ui.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/jquery.form.min.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/core.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/index.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/core_lk.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/imageupload.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/progress.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/notie.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/photo.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/comments.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/newcore.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/act.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/selector2.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/selector.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <script src="/static/js/tablesort.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) { echo '?'.time(); } ?>"></script>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css">
    <div class="progress-container fixed-top">
<span class="progress-bard"></span>
</div>
<style>

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
  
</style>
<script>
    notie.setOptions({
    transitionCurve: 'cubic-bezier(0.2, 0, 0.2, 1)'
});
var Notify =  {
    noty: function(status, text) {

        if (status == 'danger') status = 'error';

        return notie.alert({ type: status, text: text })

    },
}
function scrollProgressBarWidth(number) {
                var getMax = function() {
                    return $(document).height() - $(window).height();
                };
                var progressBar = $(".progress-bard"),
                    max = getMax(),
                    value,
                    width;

                var setWidth = function() {
                    progressBar.css({
                        width: number + '%'
                    });
                };

                setWidth();
            }
            
function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
</script>

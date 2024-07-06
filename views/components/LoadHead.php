<meta http-equiv="content-type" content="text/html;charset=UTF-8">
    <meta name="viewport" content="width=1000,user-scalable=yes">
    <title>NativeGallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans+Narrow:wght@400;700&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
    <link rel="stylesheet" href="/static/css/desktop.css">
    <link rel="stylesheet" href="/static/css/trans.css">
    <link rel="stylesheet" href="/static/css/photo.css">
    <link rel="stylesheet" href="/static/css/notie.css">
    <link rel="stylesheet" href="/static/css/comments.css">
    <link rel="stylesheet" href="/static/css/map.css">
    <script src="/static/js/jquery.js"></script>
    <script src="/static/js/jquery-ui.js"></script>
    <script src="/static/js/jquery.form.min.js"></script>
    <script src="/static/js/core.js"></script>
    <script src="/static/js/core_lk.js"></script>
    <script src="/static/js/imageupload.js"></script>
    <script src="/static/js/progress.js"></script>
    <script src="/static/js/notie.js"></script>
    <script src="/static/js/photo.js"></script>
    <script src="/static/js/comments.js"></script>
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
  background-color: var(--theme-bg-color); 
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

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

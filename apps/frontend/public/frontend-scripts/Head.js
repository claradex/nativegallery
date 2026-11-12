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
    for (const bar of document.querySelectorAll(".progress-bard")) {
        bar.style.width = number + "%";
    }
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

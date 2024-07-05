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
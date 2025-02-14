function changeTab(id) {
    const $activeTabs = $('.v-tab-b.v-tab--active');
    const $activeBlocks = $('.active__block');

    if ($activeTabs.length) {
        $activeTabs.removeClass('v-tab--active');
    }

    $('#' + id).addClass('v-tab--active');

    if ($activeBlocks.length) {
        $activeBlocks.animate({
            opacity: 0,
        }, 200, function () {
            $(this).css('display', 'none').removeClass('active__block');
            
            // Вторая анимация
            $('#' + id + '__block').css({
                display: 'block',
                opacity: 0
            }).animate({
                opacity: 1
            }, 150, function () {
                $(this).addClass('active__block');
            });
        });
    }
}
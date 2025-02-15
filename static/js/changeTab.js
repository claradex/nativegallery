function changeTab(id) {
    const $activeTabs = $('.v-tab-b.v-tab--active');
    const $activeBlocks = $('.active__block');
    const $newTab = $('#' + id);

    if ($activeTabs.length) {
        $activeTabs.removeClass('v-tab--active');
    }

    $newTab.addClass('v-tab--active');

    if ($activeBlocks.length) {
        $activeBlocks.stop(true, true).animate({
            opacity: 0,
        }, 200, function () {
            $(this).css('display', 'none').removeClass('active__block');

            const $newBlock = $('#' + id + '__block');
            $newBlock.css({
                display: 'block',
                opacity: 0
            }).animate({
                opacity: 1
            }, 150, function () {
                $(this).addClass('active__block');
            });
        });
    } else {
        // Если нет активных блоков, сразу показываем новый блок
        $('#' + id + '__block').css({
            display: 'block',
            opacity: 0
        }).animate({
            opacity: 1
        }, 150, function () {
            $(this).addClass('active__block');
        });
    }
}

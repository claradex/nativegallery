(function (threshold) {
  const countdown = document.getElementById('countdown');
  if (!countdown || !Number.isFinite(threshold)) return;

  async function check() {
    if (Date.now() >= threshold * 1000) {
      countdown.textContent = 'Ожидаем ответ от сервера...';
      try {
        const response = await fetch('/api/contests/getinfo', { cache: 'no-store' });
        if (response.ok) {
          const { statuses, contest } = await response.json();
          if (statuses?.pretends === 'closed' && statuses.public === 'opened' && contest?.closedate) {
            document.getElementById('textContest').textContent =
              'Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!';
            document.getElementById('timett').textContent = 'Закончится через:';
            const link = document.createElement('a');
            link.href = '/voting';
            link.style.backgroundColor = '#37009D';
            link.style.color = '#fff';
            link.setAttribute('type', 'button');
            link.textContent = 'Голосовать!';
            document.getElementById('contestBtns').replaceChildren(link);
            startCountdown(contest.closedate);
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    window.setTimeout(check, 1000);
  }

  window.setTimeout(check, 1000);
})(Number(document.currentScript.dataset.contestTime));

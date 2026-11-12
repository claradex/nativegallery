function startCountdown(unixTimestamp) {
	function padZero(num) {
		return num < 10 ? '0' + num : num;
	}

	function getWord(num, words) {
		if (num % 10 === 1 && num % 100 !== 11) return words[0];
		if (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20)) return words[1];
		return words[2];
	}

	function updateTimer() {
		const now = Math.floor(Date.now() / 1000);
		const diff = unixTimestamp - now;

		if (diff <= 0) {
			clearInterval(interval);
			document.getElementById('countdown').textContent = "00 дней 00 часов 00 минут 00 секунд";
			return;
		}

		const days = Math.floor(diff / 86400);
		const hours = Math.floor((diff % 86400) / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const seconds = diff % 60;

		document.getElementById('countdown').textContent =
			`${padZero(days)} ${getWord(days, ['день', 'дня', 'дней'])} ` +
			`${padZero(hours)} ${getWord(hours, ['час', 'часа', 'часов'])} ` +
			`${padZero(minutes)} ${getWord(minutes, ['минута', 'минуты', 'минут'])} ` +
			`${padZero(seconds)} ${getWord(seconds, ['секунда', 'секунды', 'секунд'])}`;
	}

	const interval = setInterval(updateTimer, 1000);
	updateTimer();
}

(function (contestTime) {
$(document).ready(function () {
                                    let unixThreshold = contestTime; // Задайте нужное значение UNIX
                                    let checkInterval = 1000; // Интервал проверки в миллисекундах (1 секунда)
                                    let isRequestSent = false;

                                    function checkUnixTime() {
                                        let currentUnixTime = Math.floor(Date.now() / 1000);

                                        if (currentUnixTime > unixThreshold) {
                                            $("#countdown").text("Ожидаем ответ от сервера...");

                                            $.ajax({
                                                url: "/api/contests/getinfo", // Укажите свой URL
                                                method: "GET",
                                                success: function (response) {

                                                    let data = typeof response === "string" ? JSON.parse(response) : response;
                                                      if (data.statuses.pretends === "closed" && data.statuses.public === "opened") {
                                                        clearInterval(pingInterval); // Останавливаем старый пинг
                                                        $("#textContest").text("Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!");
                                                        $("#timett").text("Закончится через:");
                                                        $("#contestBtns").html(`<a href="/voting" style="background-color: #37009D; color: #fff;" type="button">Голосовать!</a>`)
                                                        unixThreshold = data.contest.closedate;
                                                        startCountdown(data.contest.closedate);
                                                        pingInterval = setInterval(checkUnixTime, checkInterval);
                                                    }
                                                },
                                                error: function (xhr, status, error) {
                                                    console.error("Ошибка запроса:", error);
                                                }
                                            });
                                        } else {
                                            console.log(currentUnixTime);
                                        }
                                    }

                                    // Запускаем периодический пинг
                                    let pingInterval = setInterval(checkUnixTime, checkInterval);
                                });
})(Number(document.currentScript.dataset.contestTime));

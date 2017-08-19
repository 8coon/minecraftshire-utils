
/**
 * @return {number} Minutes (отрицательный для всего, что западнее UTC, положительный -- для всего, что восточнее)
 */
export function getLocalTZMinuteOffset() {
    // getTimezoneOffset() вернёт то, сколько нужно отнять минут от текущего времени, чтобы получить UTC,
    // а нам нужно знать, сколько ко времени UTC нужно прибавить, чтобы получить текущее.
    return new Date().getTimezoneOffset() * -1;
}

/**
 * @param {string} time (Например: '12:29:54.675737-04', или '12:29:54+03' или '12:29:54+02:30' или '12:29:54Z')
 * @return {{hours: number, minutes: number, seconds: number, minutesOffset: number}}
 */
export function parseTime(time) {
    // UTC-время
    if (time.endsWith('Z') || time.endsWith('z')) {
        return 0;
    }

    // Находим, откуда начинается смещение часового пояса
    var signIdx = time.lastIndexOf('+');
    if (signIdx === -1) {
        signIdx = time.lastIndexOf('-');
    }

    var timePart = time.substring(0, signIdx);
    var tzPart = time.substring(signIdx);
    var delimIdx = tzPart.indexOf(':');
    var minutesOffset = 0;

    // Парсим часовой пояс
    if (delimIdx >= 0) {
        // Если смещение указано в полном виде
        tzPart = tzPart.split(':');
        minutesOffset = parseInt(tzPart[0], 10) * 60 + parseInt(tzPart[1], 10);
    } else {
        // Если в кратком
        minutesOffset = parseInt(tzPart, 10) * 60;
    }

    // Парсим время
    timePart = timePart.split(':');
    var hours = parseInt(timePart[0], 10);
    var minutes = parseInt(timePart[1], 10);
    // Секунд может и не быть
    var seconds = timePart[2] ? Math.round(parseFloat(timePart[2])) : 0;

    return {hours: hours, minutes: minutes, seconds: seconds, minutesOffset: minutesOffset};
}

/**
 * @param {string} s (Например: '2017-08-17', или '2017.08.17', или '2017/08/17'
 * @return {{year: number, month: number, day: number}}
 */
export function parseDate(s) {
    var parts = s.replace('.', '-').replace('/', '-').split('-');
    return {year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1, day: parseInt(parts[2], 10)};
}

/**
 * Распарсит строку в ISO-формате в объект Date с учётом локального часового пояса и часового пояса строки
 * @param {string} s (Например: '2017-08-17 12:29:54.675737-04')
 */
export function parseDateTime(s) {
    s = s.replace(' ', 'T');
    var parts = s.split('T');
    var date = parseDate(parts[0]);
    var time = parseTime(parts[1]);

    var dateObj = new Date(date.year, date.month, date.day, time.hours, time.minutes, time.seconds);

    // Получаем полное смещение локального часового пояса и часового пояса строки в минутах
    var timeOffset = time.minutesOffset - getLocalTZMinuteOffset();
    dateObj.setTime(dateObj.getTime() + timeOffset * 60*1000);

    return dateObj;
}

/**
 * @param {number} n
 * @return {string} (3 станет '03')
 */
export function intToStrFormatted(n) {
    if (n < 0) {
        return '-' + intToStrFormatted(-n);
    }

    return (n < 10) ? '0' + String(n) : String(n);
}

/**
 * @param {Date} date
 * @return {string} 2017-08-17T12:29:54+03
 */
export function serializeDateTime(date) {
    var tzOffsetMinutes = getLocalTZMinuteOffset();
    var tzOffsetHours = tzOffsetMinutes / 60;
    var tzOffset = 'Z';

    // Смещение часового пояса -- не UTC
    if (tzOffsetMinutes !== 0) {
        var tzSign = tzOffsetHours < 0 ? '-' : '+';
        tzOffsetHours = Math.abs(tzOffsetHours);

        if (Math.floor(tzOffsetHours) === Math.ceil(tzOffsetHours)) {
            // Смещение можно записать кратко
            tzOffset = tzSign + intToStrFormatted(tzOffsetHours);
        } else {
            // Нельзя
            var tzHours = Math.floor(tzOffsetHours);
            var tzMinutes = tzOffsetMinutes - tzHours * 60;
            tzOffset = tzSign + intToStrFormatted(tzHours) + ':' + intToStrFormatted(tzMinutes);
        }
    }

    return '' +
        String(date.getFullYear()) + '-' +
        intToStrFormatted(date.getMonth() + 1) + '-' +
        intToStrFormatted(date.getDate()) + ' ' +
        intToStrFormatted(date.getHours()) + ':' +
        intToStrFormatted(date.getMinutes()) + ':' +
        intToStrFormatted(date.getSeconds()) +
        tzOffset;
}


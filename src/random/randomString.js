
var chars = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm0123456789'.split('');


/**
 * Generates random string of the specified length
 * @param {number} length
 * @return {string}
 */
export function randomString(length) {
    length = length || 30;

    return Array.from({length}, function() {
        var idx = Math.floor(Math.random() * chars.length);

        return chars[idx];
    }).join('');
}


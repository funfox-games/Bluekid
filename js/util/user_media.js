export const DEFAULT_MAX_CHAR = 64;
export const MAX_CHAR_NAME = 48;
export const MAX_CHAR_DESCRIPTION = 512;
export const MAX_KIT_QUESTION = 128;

/**
 * Filter a string from bad words
 * @param {String} str The string to check
 * @returns {String}
 */
export function filter(str) {
    return str;
}
/**
 * Check if a string is beond the char limit.
 * @param {String} str The string to check
 * @param {Number} charLimit The character amount
 * @returns {Boolean}
 */
export function isLimited(str, charLimit) {
    return str.length > charLimit;
}

/**
 * Limits a string from the requested character limit if needed.
 * @param {String} str The string to limit
 * @param {Number} charLimit The character limit
 * @returns {String}
 */
export function limit(str, charLimit) {
    if (!isLimited(str, charLimit)) {return str;}
    return str.slice(0, charLimit);
}
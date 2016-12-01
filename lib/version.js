/**
 * Player JS API Version.
 */
const version = 1;
export default version;

/**
 * Return versioned event string.
 *
 * @param event
 * @returns {string}
 */

export const versionEvent = event => {
  return `v${version}.${event}`;
};

/**
 * Strip versioning from event string.
 *
 * @param event
 * @returns {string}
 */
export const unversionEvent = event => {
  return event.replace(`v${version}.`, '');
};
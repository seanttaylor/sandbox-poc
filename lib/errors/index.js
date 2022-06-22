/**
 * @typedef ApplicationErrorInterface
 * @property {String} id
 * @property {String} message
 * @property {String} module
 * @property {String} name
 */

/**
 * @typedef EmittedApplicationErrorInterface
 * @property {String} id
 * @property {String} message
 * @property {String} module
 * @property {String} name
 * @property {String} timestamp
 */

/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  box.put('errors', { ApplicationError });

  /**
   * @param {ApplicationErrorInterface} error
   */
  function ApplicationError(error) {
    const errorText = `ApplicationError.InternalError.${error.name} (${error.id}) => ${error.message}`;
    const emittedError = Object.assign(error, {
      message: errorText,
      timestamp: new Date().toISOString(),
    });

    box.get('events').emit('application.error', emittedError);

    //throw Error(errorText);
  }
}

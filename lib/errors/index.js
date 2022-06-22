/**
 * @param {Object} box - the application sandbox
 */
export default function(box) {
  box.put('errors', { ApplicationError });

  /**
   * @param {String} errorName
   * @param {String} errorMessage
   * @param {String} moduleName
   */
  function ApplicationError({ errorName, errorType, moduleName }) {
    const errorText = `ApplicationError.InternalError.${errorName} => ${errorType}`;

    box.get('events').emit('application.error', {
      errorTimestamp: new Date().toISOString(),
      errorText,
      errorType,
      moduleName,
    });

    throw Error(errorText);
  }
}

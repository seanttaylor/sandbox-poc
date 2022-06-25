/**
 * @typedef ApplicationErrorInterface
 * @property {String} id
 * @property {String} message
 * @property {String} module
 * @property {String} name
 */

/**
 * @param {ApplicationErrorInterface} error
 */
 function ApplicationError(error) {
  const errorText = `ApplicationError.InternalError.${error.name} (${error.id}) => ${error.message}`;
  const emittedError = Object.assign(error, {
  message: errorText,
  timestamp: new Date().toISOString(),
  });

  return emittedError;
}

export default { ApplicationError };


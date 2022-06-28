/**
 * @typedef ApplicationErrorInterface
 * @property {String} code
 * @property {String} message
 * @property {String} module
 * @property {String} name
 * @property {String} _open
 */

/**
 * @param {ApplicationErrorInterface} error
 */
 function ApplicationError(error) {
  // validate error body here
  const errorText = `ApplicationError.InternalError.${error.name} (${error.code}) => ${error.message}`;
  const emittedError = Object.assign(error, {
  message: errorText,
  timestamp: new Date().toISOString(),
  });

  return emittedError;
}

export default { ApplicationError };


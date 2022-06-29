import Ajv from 'ajv';
import applicationErrorSchema from '../../../schemas/application-error.js';

const ajv = new Ajv();

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
 function ApplicationError(error={}) {
  const validate = ajv.compile(applicationErrorSchema);

    if (!validate(error)) {
      /* istanbul ignore next line */
      // Reason: The inverse of this `if` clause will be exercised in production
      if (process.env.NODE_ENV !== 'test/ci/cd') {
        console.error(`ApplicationError.MetaError.CouldNotCreateError: ${JSON.stringify(
          validate.errors,
          null,
          2,
        )})`     
        );
      }
      return;
    }

  const errorText = `ApplicationError.InternalError.${error.name} (${error.code}) => ${error.message}`;
  const emittedError = Object.assign(error, {
    message: errorText,
    timestamp: new Date().toISOString(),
  });

  return emittedError;
}

export default { ApplicationError };


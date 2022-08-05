import Ajv from 'ajv';
import applicationErrorSchema from '../../../schemas/application-error.js';
import { IConsole } from '../../interfaces/console.js';
import SimpleConsole from '../console/index.js'

const ajv = new Ajv();
const console = IConsole(SimpleConsole);

/** 
 * A service providing consistent error messaging functionality to all application modules. **This is a 
 * default sandbox API that is available to *all* client-defined modules.**
 * @module Errors
 */


/**
 * @typedef ApplicationErrorInterface
 * @property {String} code - a short semantically unique code that distiguishes a specific error; used to catalog and sort errors
 * @property {String} message - a human readable error message 
 * @property {String} module - the module that produced the error
 * @property {String} name - the name of the the error 
 * @property {String} _open
 */

/**
 * Creates a structured error object describing an error produced in the application, suitable for 
 * display on standard output or transport to a logging system.
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


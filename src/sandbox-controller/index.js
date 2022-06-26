import ajax from './ajax/index.js';
import database from './database/connectors/memory.js';
import events from './events/index.js';
import errors from './errors/index.js';

/**
 * Attaches key functions to the sandbox that all modules have access to. Exposes
 * an API for modules to register or request functionalities from the sandbox. 
 * @param {Object} box - plain JavaScript object that will house the public APIs of registered modules
 * @returns {Object}
 */
function SandboxController(box) {
  box.my = {};

  /**
   * Registers a module's API on the sandbox, this is the functionality a module exposes to the rest of the app via the sandbox.
   * @param {String} moduleName - the namespace the functionality will live under on the sandbox
   * @param {Object} moduleAPI - the API exposed by the module
   */
  function put(moduleName, moduleAPI) {
    // We don't need to re-register moduleAPIs that have already been registered
    if (box['my'][moduleName]) {
      return
    }
    box['my'][moduleName] = moduleAPI;
  }
      
    return {
      controller: {
        ajax,
        database,
        errors,
        events,
        put
      }
    }
}

export default SandboxController; 



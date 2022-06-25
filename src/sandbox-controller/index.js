import ajax from './ajax/index.js';
import events from './events/index.js';
import errors from './errors/index.js';

/**
 * Attaches key functions to the application Sandbox that all modules have access to. Includes a 
 * limited set of all the capabilities of the application to allow modules to do only
 * *their* work. Exposes a minimal API for modules to register or request functionalities from the Sandbox. Allows the
 * application to start and stop modules.
 * @param {Object} box
 * @returns {Object}
 */
function SandboxController(box) {
  box.my = {};

  /**
   * Returns the sandboxed module APIs that have been registered on `box` with the `put` method.
   * @returns {Object}
   */
  function get() {
    return box;
  }

  /**
   * Registers a module's API on the Sandbox, this is the functionality a module exposes to the rest of the app via the Sandbox.
   * @param {String} moduleName - the namespace the functionality will live under on the application Sandbox
   * @param {Object} moduleAPI - the API exposed by the module
   */
  function put(moduleName, moduleAPI) {
    // We don't need to re-register moduleAPIs that have already been declared
    if (box['my'][moduleName]) {
      return
    }
    box['my'][moduleName] = moduleAPI;
  }
      
    return {
      controller: {
        ajax,
        errors,
        events,
        put
      },
      get
    }
}

export default SandboxController; 



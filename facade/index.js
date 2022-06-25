import ajax from './ajax/index.js';
import events from './events/index.js';
import errors from './errors/index.js';


/**
 * Attaches key utility functions to the application Sandbox all modules have access to. Includes a 
 * limited set of all the capabilities of the application to allow modules to do 
 * their work. Exposes a minimal API for modules to register or request functionalities from the Sandbox.
 * @param {Object} box
 * @returns {Object}
 */
function Facade(box) {
  box.my = {};

  /**
   * Registers a module's API on the Sandbox, this is the functionality a module exposes to the rest of the app via the Sandbox
   * @param {String} moduleName - the namespace the functionality will live under on the application Sandbox
   * @param {Object} moduleAPI - the API exposed by the module
   */
  function put(moduleName, moduleAPI) {
    box['my'][moduleName] = moduleAPI;
  }
  
    return Object.assign(box, {
      ajax,
      errors,
      events,
      put,
    });
}

export default Facade; 



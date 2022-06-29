/* istanbul ignore file*/
// Reason: Related to Jest's current lack of support for ES modules. See (https://github.com/seanttaylor/sandbox-poc/issues/8)
import ajax from './ajax/index.js';
import database from './database/connectors/memory.js';
import events from './events/index.js';
import errors from './errors/index.js';

const defaultApplicationModules = {
  ajax,
  database,
  events,
  errors,
}

/**
 * Attaches key functions to the sandbox that all modules have access to. Exposes
 * an API for modules to register or request functionalities from the sandbox. 
 * @param {Object} box - plain JavaScript object that will house the public APIs of registered modules
 * @returns {Object}
 */
function SandboxController(box) {
  box.my = {};
  box.my.plugins = {}

  /**
   * Registers a module's API on the sandbox, this is the functionality a module exposes to the rest of the app via the sandbox.
   * @param {String} moduleName - the namespace the functionality will live under on the sandbox
   * @param {Object} moduleAPI - the API exposed by the module
   */
  function put(moduleName, moduleAPI) {
    const isPlugin = moduleName.includes('/plugins/');

    // We don't need to re-register moduleAPIs that have already been registered
    if (box['my'][moduleName]) {
      return
    }

    if (isPlugin) {
      box['my']['plugins'][moduleName] = moduleAPI.myPlugin;
      return;
    }

    box['my'][moduleName] = moduleAPI;
  }

  /**
   * 
   * @param {String} extend - the name of the existing module the plugin extends
   * @param {Function} fn - the business logic of the plugin
   * @param {String} name - the namespace of the the plugin on the sandbox
   */
  function plugin({ extend, fn, name }) {
    const unpluggedModule = box[extend];
    box['my'][name] = fn(unpluggedModule);
  }

  /**
   * 
   * @param {String} module 
   */
  function get(module) {
    return defaultApplicationModules[module];
  }

  return {
    controller: {
      //ajax,
      //database,
      //errors,
      //events,
      get,
      plugin,
      put
    }
  }
}

export default SandboxController;



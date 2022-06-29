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
  box.my.plugins = {};
  box.plugins = {};

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

  /**
   * 
   * @param {Boolean} extendsDefault - indicates whether the module being extends is a default or client module
   * @param {Function} fn - the business logic of the plugin
   * @param {String} name - the namespace of the the plugin on the sandbox
   * @param {String} of - the name of the existing module the plugin extends

   */
  function plugin({ extendsDefault, fn, name, of }) {
    // This plugin extends a default module
    if (extendsDefault) {
      const unpluggedModule = box[of]; 
      // Since this plugin extends a default module we want to make its functionality immediately available by applying the plugin
      box['plugins'][name] = fn(unpluggedModule);
      return;
    }
    // Plugins that extend client modules are applied at the descretion of the application core
    box['my']['plugins'][name] = fn;
  }

  /**
   * 
   * @param {String} module - the name of the module to retrieve
   */
  function get(module) {
    // The requested module is a plugin
    if (module.includes('/plugins/')) {
      
      if (!box['plugins'][module]) {
        console.error(`PluginError.NotFound (${module}) => Could not find the requested plugin`);
        return;
      }
      
      return box['plugins'][module];
    }
    return defaultApplicationModules[module];
  }

  return {
    controller: {
      get,
      plugin,
      put
    }
  }
}

export default SandboxController;



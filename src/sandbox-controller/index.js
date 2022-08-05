/* istanbul ignore file*/
// Reason: Related to Jest's current lack of support for ES modules. See (https://github.com/seanttaylor/sandbox-poc/issues/8)
import ajax from './ajax/index.js';
import database from './database/connectors/memory.js';
import events from './events/index.js';
import errors from './errors/index.js';
import { IConsole } from '../interfaces/console.js';
import SimpleConsole from './console/index.js';

const console = IConsole(SimpleConsole);
const defaultSandboxAPIs = {
  ajax,
  console,
  database,
  events,
  errors,
}

/**
 * Provides proxied access to default and client-defined APIs to the Application Core on boot.
 * Attaches key methods on the sandbox that the application core and *client-defined* modules have access to. Exposes
 * an API for client-defined modules to register or request functionalities from the default sandbox APIs. 
 * @param {Object} box - plain JavaScript object that will house the public APIs of registered client-defined modules
 * @module SandboxController 
 * @returns {Object}
 */
function SandboxController(box) {
  box.my = {};
  box.my.plugins = {};
  box.plugins = {};

  /**
   * Registers a client-defined module's API on the sandbox. This is the functionality a module exposes to the rest of the app via the sandbox.
   * @param {String} moduleName - the namespace the functionality will live under on the sandbox
   * @param {Object} moduleAPI - the API exposed by the client-defined module
   * @memberof module:SandboxController
   */
  function put(moduleName, moduleAPI) {
    // We don't need to re-register client-defined module APIs that have already been registered
    if (box['my'][moduleName]) {
      return
    }

    box['my'][moduleName] = moduleAPI;
  }

  /**
   * Constructor for creating a plugin for an existing default *or* client-defined module
   * @param {Boolean} extendsDefault - indicates whether the code being extended is a default sandbox API or client-defined module
   * @param {Function} fn - the business logic of the plugin
   * @param {String} name - the namespace of the the plugin on the sandbox
   * @param {String} of - (optional) the name of the existing module the plugin extends
   * @memberof module:SandboxController
   */
  function plugin({ extendsDefault, fn, name, of }) {
    // The client has committed an error
    if (extendsDefault && !of) {  
      console.error('PluginError.BadRequest.CannotRegisterPlugin => Plugins of *DEFAULT* modules cannot be created without an `of` parameter specifying the module the plugin extends. Either set `extendsDefault` to `false` to indicate this plugin *DOES NOT* extend a *DEFAULT* module OR define the `of` parameter in the call to `sandbox.plugin`.')
      return
    }

    // This plugin extends a default sandbox API 
    if (extendsDefault) {
      const unpluggedModule = defaultSandboxAPIs[of]; 
      // Since this plugin extends a default sandbox API we want to make its functionality immediately available by applying the plugin
      box['plugins'][name] = fn(unpluggedModule);
      return;
    }

    // This plugin extends a client-defined module
    // Plugins that extend client-defined modules are applied at the descretion of the application core
    box['my']['plugins'][name] = { load: fn };
  }

  /**
   * Retrieves a specififed default API defined on the sandbox
   * @param {String} module - the name of the module to retrieve
   * @memberof module:SandboxController
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
    return defaultSandboxAPIs[module];
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



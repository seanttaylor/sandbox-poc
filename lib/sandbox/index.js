import SandboxController from './controller.js';

const myModules = {};
const controller = SandboxController(myModules);

/**
 * Registers the constructor function for a module; reserves a placeholder for a registering a method to stop the module 
 * @param {String} moduleName 
 * @param {Function} myModule
 */
function module(moduleName, myModule) {
  myModules[moduleName] = {
    init: myModule,
    stop: null
  };
}

/**
 * The Sandbox that all modules have access to. Includes a limited set of all the capabilities of the application to 
 * allow modules to do their work. Exposes a minimal API for modules to register or request functionalities from the Sandbox.
 * @param {Object} box
 */
function sandboxWrapper(box) {

  /**
   * Gets a registered module's API from the Sandbox
   * @param moduleName - a specified module; a namespaced API exposed on the Sandbox 
   * @returns {Object}
   */
  function get(moduleName) {
    return box[moduleName];
  }

  /**
   * Registers a module's API on the Sandbox, this is the functionality a module exposes to the rest of the app
   * @param {String} moduleName - the namespace the functionality will live under on the application Sandbox
   * @param {Object} moduleAPI - the API exposed by the module
   */
  function put(moduleName, moduleAPI) {
    box[moduleName] = moduleAPI;
  }

  return {
    get,
    put,
  };
}

/**
 * Ensures a function will only executed once
 * @param {Function} fn - the function to invoke 
 */
function once(fn) {
  let executionCount = 0;
  return function(args) {
    if (executionCount >= 1) {
      return;
    }
    executionCount++;
    return fn(args);
  }
}

/**
 * Creates a new application with access to sandboxed library APIs
 * @param {Array} modulesList - list of modules to register on the application sandbox
 * @param {Function} callback - the app that will be launched once the sandboxed modules are initialized
 */
async function of(modulesList, callback) {
  const box = sandboxWrapper({});

  // no modules or "*" both mean "use all modules"
  if (!modulesList || modulesList === '*') {
    modulesList = [];

    for (let i in myModules) {
      if (myModules.hasOwnProperty(i)) {
        modulesList.push(i);
      }
    }
  }

  // initialize the required modules
  for (let i = 0; i < modulesList.length; i += 1) {
    if (!Object.keys(myModules).includes(modulesList[i])) {
      console.error(
        `InitializationError.ModuleNotFound => Cannot find module: (${modulesList[i]})`
      );
      continue;
    }

    try {
      // register a reference to each module with the Sandbox controller to track module state
      controller.addModule(modulesList[i]);
      
      // initialize modules
      // initialized modules return a function to tear down any resources when modules are stopped
      const stopFn = myModules[modulesList[i]]['init'](box);

      // return a `stop` function that does nothing by default
      myModules[modulesList[i]]['stop'] = stopFn ? stopFn : once(()=> {});
      
    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.message} `
      );
    }
  }

  // launch the app
  try {
    await callback(box, controller);
  } catch (e) {
    console.error(
      `Application.InternalError.UncaughtModuleError => ${e.message}`
    );
    controller.stopAll(myModules);
  }
}

export default {
  module,
  of,
};

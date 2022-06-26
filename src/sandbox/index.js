import SandboxController from '../sandbox-controller/index.js';

const box = {};
const myModules = {};

/**
 * Freezes an object and all its child properties recursively, making the object immutable
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze for more on freezing objects
 * @param {Object} object 
 * @returns 
 */
function deepFreeze(object) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self

  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}

/**
 * Exposes the API for starting and stopping modules to the application core; makes all registered module APIs immutable.
 * @param {Object} box - map APIs of registered modules
 * @param {Object} sandboxController - an instance of the SandboxController interface
 * @returns {Object}
 */
function applicationSandboxWrapper(box, sandboxController) {
  const wrappedSandbox = Object.assign(box, {
    ...sandboxController,
    moduleCtrl : myModules,
  });

  return deepFreeze(wrappedSandbox);
}

/**
 * Registers the constructor function for a module; reserves a placeholder for a registering a method to stop the module
 * @param {String} moduleName 
 * @param {Function} myModule
 */
function module(moduleName, myModule) {
  myModules[moduleName] = { start: myModule, stop: null };
}

/**
 * Creates a new application with access to sandboxed module APIs
 * @param {Array} modulesList - list of modules to register on the application sandbox
 * @param {Function} callback - the app that will be launched once the sandboxed modules are initialized
 */
async function of(modulesList, callback) {
  const { controller } = deepFreeze(SandboxController(box));

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
      // initialize modules
      let stopFn = myModules[modulesList[i]]['start'](controller);

      // bind the controller to the module constructor for future invocations
      myModules[modulesList[i]]['start'] = myModules[modulesList[i]]['start'].bind(null, controller);

      // initialized modules *may* return a function to tear down any resources when the module is stopped
      myModules[modulesList[i]]['stop'] = stopFn ? stopFn : ()=> {}

    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.message} `
      );
    }
  }

  // launch the application
  try {
    await callback(applicationSandboxWrapper(box, controller));
  } catch (e) {
    console.error(
      `Application.InternalError.UncaughtModuleError => ${e.message}`
    );
    // controller.stopAll(myModules);
  }
}

export default {
  module,
  of,
};

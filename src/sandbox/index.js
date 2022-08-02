/* istanbul ignore file*/
// Reason: Related to Jest's current lack of support for ES modules. See (https://github.com/seanttaylor/sandbox-poc/issues/8)
import SandboxController from '../sandbox-controller/index.js';

/**
 * Provides constructor methods for creating client-defined modules and applications that can leverage those modules.
 * @module Sandbox
 */


// The sandboxed API modules that will ultimately be available to the application core
const box = {};
// A map of all client-defined modules that have been registered with application core
const myModules = {};

/**
 * Freezes an object and all its child properties recursively, making the object immutable
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze for more on freezing objects
 * @param {Object} object - a plain JavaScript object
 * @returns {Object} - the frozen object
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
 * Exposes the API for starting and stopping *client-defined* modules to the application core; makes all APIs immutable--both client-defined 
 * module APIs and default sandbox APIs.
 * @param {Object} box - sandboxed API modules
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
 * Registers the constructor function for a client-defined module; reserves a placeholder for a registering a method to stop the module
 * @param {String} moduleName 
 * @param {Function} myModule
 */
function module(moduleName, myModule) {
  myModules[moduleName] = { start: myModule, stop: null };
}

/**
 * Creates a new application with access to default sandbox APIs and any registered client-defined module APIs.
 * @param {Array} modulesList - list of modules to register on the application sandbox
 * @param {Function} callback - the app that will be launched once the sandboxed modules are initialized
 */
async function of(modulesList, callback) {
  const { controller } = deepFreeze(SandboxController(box));
  //const { controller } = SandboxController(box);

  // no modules or "*" both mean "use all modules"
  if (!modulesList || modulesList === '*') {
    modulesList = [];

    for (let i in myModules) {
      if (myModules.hasOwnProperty(i)) {
        modulesList.push(i);
      }
    }
  }

  
  for (let i = 0; i < modulesList.length; i += 1) {
    if (!Object.keys(myModules).includes(modulesList[i])) {
      console.error(
        `InitializationError.ModuleNotFound => Cannot find module: (${modulesList[i]})`
      );
      continue;
    }

    try {
      // initialize required client-defined modules
      let stopFn = myModules[modulesList[i]]['start'](controller);

      // bind the controller to the module constructor for future invocations
      myModules[modulesList[i]]['start'] = myModules[modulesList[i]]['start'].bind(null, controller);

      // initialized client-defined modules *may* return a function to tear down any resources when the module is stopped
      myModules[modulesList[i]]['stop'] = stopFn ? stopFn : ()=> {}

    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.stack} `
      );
    }
  }

  // launch the applicationc core
  try {
    callback(applicationSandboxWrapper(box, controller));
  } catch (e) {
    console.error(
      `Application.InternalError.UncaughtModuleError => ${e.stack}`
    );
  }
}

export default {
  module,
  of,
};

import SandboxController from './controller.js';

const myModules = {};
const controller = SandboxController(myModules);

/**
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
 * @param {Object} box
 */
function sandboxWrapper(box) {

  /**
   * @param moduleName
   */
  function get(moduleName) {
    return box[moduleName];
  }

  /**
   * @param {String} moduleName
   * @param {Object} moduleAPI
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
 * @param {Array} dependencies
 * @param {Function} callback
 */
async function of() {
  const args = Array.prototype.slice.call(arguments);
  const callback = args.pop();
  const box = sandboxWrapper({});

  // modules can be passed as an array or as individual parameters
  const modulesList = args[0] && typeof args[0] === 'string' ? args : args[0];

  // no modules or "*" both mean "use all modules"
  if (!modulesList || modulesList === '*') {
    modulesList = [];

    for (let i in modules) {
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
      controller.addModule(modulesList[i]);
      const stopFn = myModules[modulesList[i]]['init'](box);
      myModules[modulesList[i]]['stop'] = stopFn ? stopFn : ()=> {};
      
    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.message} `
      );
    }
  }

  // call the callback
  try {
    await callback(box, controller);
  } catch (e) {
    console.error(
      `Application.InternalError.UncaughtModuleError => ${e.message}`
    );
  }
}

export default {
  module,
  of,
};

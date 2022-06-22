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
 * @param {Array} modulesList
 * @param {Function} callback
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
      // register a reference to each module with the controller to track module state
      controller.addModule(modulesList[i]);
      
      // initialized modules can return a function to tear down any resources when modules are stopped
      const stopFn = myModules[modulesList[i]]['init'](box);

      // return a `stop` function that does nothing by default
      myModules[modulesList[i]]['stop'] = stopFn ? stopFn : ()=> {};
      
    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.message} `
      );
    }
  }

  // call the callback (i.e. launch the app)
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

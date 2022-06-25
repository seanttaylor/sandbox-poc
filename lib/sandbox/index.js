import Facade from '../../facade/index.js';

const myModules = {};

/**
 * Registers the constructor function for a module
 * @param {String} moduleName 
 * @param {Function} myModule
 */
function module(moduleName, myModule) {
  myModules[moduleName] = myModule;
}

/**
 * Creates a new application with access to sandboxed library APIs
 * @param {Array} modulesList - list of modules to register on the application sandbox
 * @param {Function} callback - the app that will be launched once the sandboxed modules are initialized
 */
async function of(modulesList, callback) {
  const box = Facade({});

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
      myModules[modulesList[i]](box);
      // let stop = myModules[modulesList[i]](box);
      // let start = myModules[modulesList[i]]
      // addModuleControls(box)({start, stop})
      
    } catch (e) {
      console.error(
        `InitializationError.InternalError in: (${modulesList[i]}) ${e.message} `
      );
    }
  }

  // launch the app
  try {
    await callback(box);
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

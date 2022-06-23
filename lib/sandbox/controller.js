const moduleMetadata = {};
const GLOBAL_ERROR_THRESHOLD = 10;

/**
 * Manages metadata about registered modules; handles uncaught module errors; stops and restarts problem modules  
 * @param {Object} modules - a *reference* to `myModules` in the `Sandbox.of` constructor
 * @returns {Object}
 */
export default function SandboxController(modules) {
 
  /**
   * Adds a module to the moduleMetadata object
   * @param {String} moduleName - a specified module that will run on the application sandbox
   */
  function addModule(moduleName) {
    moduleMetadata[moduleName] = {
      name: moduleName,
      status: 'up',
      launchTimestamp: new Date().toISOString(),
      ready: true,
      errors: {
        count: 0,
        detected: false,
        lastErrorMessage: null,
        lastErrorTimestamp: null,
        lastErrorId: null,
        lastError: null
      },
    };
  }

  /**
   * Handles all emitted ApplicationError events from modules
   * @param {AppEvent} appEvent - an instance of {AppEvent} *containing* an instance of {EmittedApplicationErrorInterface}
   * @param {Function} onErrorThresholdExceededFn
   */
  function handleModuleError(appEvent, onErrorThresholdExceededFn) {
    const { id, message, module, name, timestamp } = appEvent.payload();

    if (moduleMetadata[module]['errors']['count'] > GLOBAL_ERROR_THRESHOLD) {
      stopModule(module);
      onErrorThresholdExceededFn(module);
      return;
    }

    /*
      if (id.inclues('fatal') {
        stopModule(module)
      }
     */

    moduleMetadata[module]['errors']['count'] += 1;
    moduleMetadata[module]['errors']['detected'] = true;
    moduleMetadata[module]['errors']['lastErrorTimestamp'] = timestamp;
    moduleMetadata[module]['errors']['lastErrorId'] = id;
    moduleMetadata[module]['errors']['lastErrorMessage'] = message;
    moduleMetadata[module]['errors']['lastError'] = name;
  }

  /**
   * Restarts a specified module
   * @param {String} moduleName - a *previously registered* module on the application sandbox
   * @param {Object} box - an instance of the application sandbox
   */
   function restartModule(moduleName, box) {
    console.log(`restarting ${moduleName}`);
    try {
      const stopFn = modules[moduleName]['init'](box);
      //modules[moduleName]['stop'] = stopFn ? stopFn : ()=> {};
      //moduleMetadata[moduleName]['ready'] = true;
      //moduleMetadata[moduleName]['status'] = 'up';
    } catch(e) {
      console.error(`SandboxController.InternalError.RestartModuleError => ${e.message}`);
    }
  }

  /**
   * Stops a specified module
   * @param {String} moduleName - module registered on the application sandbox
   */
  function stopModule(moduleName) {
    /*if (moduleMetadata[moduleName]['status'] === 'down') {
      return;
    }*/
    
    moduleMetadata[moduleName]['ready'] = false;
    moduleMetadata[moduleName]['status'] = 'down';
    modules[moduleName]['stop']();
  }

  /**
   * Gets all module metadata and stats
   * @returns {Object}
   */
  function getModuleAnalytics() {
    return moduleMetadata;
  }

  /**
   * Stops all running modules
   */
  function stopAll() {
    Object.values(modules).forEach((module)=> module.stop());
  }

  return {
    addModule,
    getModuleAnalytics,
    handleModuleError,
    restartModule,
    stopModule,
    stopAll
  };
}

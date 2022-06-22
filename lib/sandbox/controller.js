const moduleMetadata = {};
const GLOBAL_ERROR_THRESHOLD = 10;

/**
 * @param {Object} modules
 * @returns {Object}
 */
export default function SandboxController(modules) {
 
  /**
   * Adds a module to the moduleMetadata object
   * @param {String} moduleName
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
   * @param {AppEvent} appEvent - an instance of {AppEvent} containing an instance of {EmittedApplicationErrorInterface}
   * @param {Function} onErrorThresholdExceededFn
   */
  function handleModuleError(appEvent, onErrorThresholdExceededFn) {
    const { id, message, module, name, timestamp } = appEvent.payload();
    if (moduleMetadata[module]['errors']['count'] > GLOBAL_ERROR_THRESHOLD) {
      moduleMetadata[module]['errors']['count']
      stopModule(module);
      onErrorThresholdExceededFn(module);
      return;
    }

    moduleMetadata[module]['errors']['count'] += 1;
    moduleMetadata[module]['errors']['detected'] = true;
    moduleMetadata[module]['errors']['lastErrorTimestamp'] = timestamp;
    moduleMetadata[module]['errors']['lastErrorId'] = id;
    moduleMetadata[module]['errors']['lastErrorMessage'] = message;
    moduleMetadata[module]['errors']['lastError'] = name;
  }

  /**
   * Stops a specified module
   * @param {String} moduleName
   */
  function stopModule(moduleName) {
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
   * @param {Object} myModules - a map of currently running modules
   */
  function stopAll(myModules) {
    Object.values(myModules).forEach((module)=> module.stop());
  }

  return {
    addModule,
    getModuleAnalytics,
    handleModuleError,
    stopModule,
    stopAll
  };
}

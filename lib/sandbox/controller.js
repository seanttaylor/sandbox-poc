const moduleAnalytics = {};

/**
 * @param {Object} modules
 * @returns {Object}
 */
export default function SandboxController(modules) {
 
  /**
   * @param {String} moduleName
   */
  function addModule(moduleName) {
    moduleAnalytics[moduleName] = {
      name: moduleName,
      status: 'up',
      launchTimestamp: new Date().toISOString(),
      ready: true,
      errors: {
        count: 0,
        detected: false,
        lastErrorTimestamp: null,
      },
    };
  }

  /**
   * @param {String} moduleName
   * @param {String} errorTimestamp
   * @param {String} errorType
   * @param {String} errorText
   * @param {Object} events
   */
  function handleModuleError({ moduleName, errorTimestamp, errorType, errorText }, events) {
    if (moduleAnalytics[moduleName]['errors']['count'] > 10) {
      stopModule(moduleName);
      events.emit('application.info.moduleStopped', {moduleName});
      return;
    }

    moduleAnalytics[moduleName]['errors']['count'] += 1;
    moduleAnalytics[moduleName]['errors']['detected'] = true;
    moduleAnalytics[moduleName]['errors']['lastErrorTimestamp'] = errorTimestamp;
  }

  /**
   * @param {String} moduleName
   */
  function stopModule(moduleName) {
    moduleAnalytics[moduleName]['ready'] = false;
    moduleAnalytics[moduleName]['status'] = 'down';
    modules[moduleName]['stop']();
  }

  /**
   * @returns {Object}
   */
  function getModuleAnalytics() {
    return moduleAnalytics;
  }

  return {
    addModule,
    getModuleAnalytics,
    handleModuleError,
    stopModule
  };
}

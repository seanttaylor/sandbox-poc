import Strategy from './strategy.js';

/**
 * Configures a strategy enabling a module experiencing errors to attempt to recover itself
 * @typedef StrategyMap
 * @property {Object.<string,Recovery>} moduleName - name of a client-defined module containing a Recovery procedure
 */

/**
 * @typedef {Object} Recovery
 * @property {String} attemptOffset
 * @property {String} moduleName - name of a client-defined module containing a Recovery procedure
 * @property {Function[]} strategies - list of functions to execute in order to recover a module experiencing errors
 */

/** @type {StrategyMap} */
const strategyMap = {};


/**
 * Instruments recovery strategies for client-defined modules that are experiencing repeated errors
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function RecoveryManager(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const console = sandbox.get('console');
    const subscriberId = 'recovery';

    sandbox.put('recovery', { getAllStrategies });

    events.on({ event: 'application.error.globalErrorThresholdExceeded', handler: onGlobalErrorThresholdExceeded, subscriberId });
    events.on({ event: 'recovery.recoveryStrategyRegistered', handler: onRecoveryStrategyRegistered, subscriberId });

    /**
     * @returns {Object}
     */
    function getAllStrategies() {
        return strategyMap;
    }

    /**
     * Adds a recovery function to a list of possible strategies for recovering a module experiencing errors
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     */
    function onRecoveryStrategyRegistered(appEvent) {
        const { moduleName, strategies } = appEvent.payload();
        strategyMap[moduleName] = {
            moduleName,
            strategies: strategies.map(({ fn, name }) => Strategy({ console, fn, name })),
            attemptOffset: 0
        };
    }

    /**
     * Attempts to execute a registered recovery strategy for a specified module
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface 
     */
    function onGlobalErrorThresholdExceeded(appEvent) {
        const { moduleName, errorCount } = appEvent.payload();

        // No recovery strategy has been registered for the module specified; nothing we can try
        if (!strategyMap[moduleName]) {
            console.warn(`RecoveryWarn.NoStrategiesRegistered => Cannot attempt recovery on module (${moduleName}); no recovery strategies have been registered.`);
            return;
        }

        const currentAttemptOffset = strategyMap[moduleName]['attemptOffset'];
        const { run: recoverModule, getName } = strategyMap[moduleName]['strategies'][currentAttemptOffset];
        const currentStrategyName = getName();

        try {
            console.info(`Attempting recovery strategy: (${currentStrategyName}) on module (${moduleName})`);
            strategyMap[moduleName]['attemptOffset'] += 1;
            strategyMap.lastAttemptedStrategy = currentStrategyName;
            recoverModule();
            strategyMap.lastAttemptedStrategyStatus = 'awaitingRecoveryValidation';

            events.notify('recovery.recoveryAttemptCompleted', {
                moduleName,
                fn: validateRecoveryAttempt.bind(null, { moduleName, errorCount })
            });

        } catch (e) {
            strategyMap.lastAttemptedStrategyStatus = 'error';
            console.error(`RecoveryError.StrategyError => Recovery strategy (${currentStrategyName}) threw an error: (${e.message}) See ./lib/recovery/index.js`);
        }
    }

    /**
     * Compares the initial module error count that trigged `onGlobalErrorThresholdExceeded` against an updated error count provided by
     * the `lib/supervisor` module
     * @param {Object} config - configuration parameters 
     * @param {String} config.moduleName - the module who's status we are evaluating
     * @param {String} config.previousModuleErrorCount - the previous total number of errors reported by this module
     * @param {Number} currentModuleErrorCount - the most recent count of errors reported by this module (provided by `lib/supervisor`)
     */
    function validateRecoveryAttempt({ moduleName, errorCount: previousModuleErrorCount }, currentModuleErrorCount) {
        if (currentModuleErrorCount <= previousModuleErrorCount) {
            strategyMap.lastAttemptedStrategyStatus = 'success';
            events.notify('recovery.moduleRecovered', moduleName);
            return;
        }
        strategyMap.lastAttemptedStrategyStatus = 'failed';
    }
}
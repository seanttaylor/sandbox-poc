import Strategy from './strategy.js';

/**
 * Configures a strategy enabling a module experiencing errors to attempt to recover itself
 * @typedef StrategyMap
 * @property {Object.<string,Recovery>} serviceName - name of a client-defined module containing a Recovery procedure
 */

/**
 * @typedef {Object} Recovery
 * @property {String} attemptOffset
 * @property {String} serviceName - name of a service containing a Recovery procedure
 * @property {Function[]} strategies - list of functions to execute in order to recover a module experiencing errors
 */


/**
 * Instruments recovery strategies for client-defined modules that are experiencing repeated errors
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function RecoveryManager(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const console = sandbox.get('console');
    const subscriberId = 'recovery';
    const strategyMap = {};

    /**************** PUBLIC API ****************/
    sandbox.put('recovery', { getAllStrategies, onGlobalErrorThresholdExceeded, onRecoveryStrategyRegistered });

    /**
     * Returns all registered recovery strategies
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
        const { serviceName, strategies } = appEvent.payload();
        strategyMap[serviceName] = {
            serviceName,
            strategies: strategies.map(({ fn, name }) => Strategy({ console, fn, name })),
            attemptOffset: 0
        };
    }

    /**
     * Attempts to execute a registered recovery strategy for a specified module
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface 
     */
    function onGlobalErrorThresholdExceeded(appEvent) {
        const { code, errorCount, serviceName } = appEvent.payload();

        // No recovery strategy has been registered for the module specified; nothing we can try
        if (!strategyMap[serviceName]) {
            console.warn(`RecoveryWarn.NoStrategiesRegistered => Cannot attempt recovery on service (${serviceName}); no recovery strategies have been registered.`);
            return;
        }

        // We're out of available strategies to try 
        if (strategyMap[serviceName]['attemptOffset'] === strategyMap[serviceName]['strategies']['length']) {
            console.warn(`RecoveryWarn.AllRegisteredRecoveryStrategiesAttempted => Attempted all available recovery strategies on module (${serviceName})`);

            strategyMap.lastAttemptedStrategyStatus = 'error';
            return;
        }

        const currentAttemptOffset = strategyMap[serviceName]['attemptOffset'];
        const { run: recoverModule, getName } = strategyMap[serviceName]['strategies'][currentAttemptOffset];
        const currentStrategyName = getName();

        try {
            console.info(`Attempting recovery strategy: (${currentStrategyName}) on service (${serviceName})`);
            strategyMap[serviceName]['attemptOffset'] += 1;
            strategyMap.lastAttemptedStrategy = currentStrategyName;
            recoverModule();
            strategyMap.lastAttemptedStrategyStatus = 'executed';

            events.notify('application.recovery.recoveryAttemptCompleted', serviceName);

        } catch (e) {
            strategyMap.lastAttemptedStrategyStatus = 'error';
            console.error(`RecoveryError.StrategyError => Recovery strategy (${currentStrategyName}) threw an error: (${e.message}) See ./lib/recovery/index.js`);
        }
    }
}
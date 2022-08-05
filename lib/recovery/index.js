import Strategy from './strategy.js';

/**
 * A configuration containing strategies to recover a module that is experiencing errors
 * @typedef Recovery
 * @property {String} attemptOffset - the number of times a recovery strategy has been attempted for this service
 * @property {String} serviceName - name of a service containing Recovery procedure(s)
 * @property {Function[]} strategies - list of functions to execute in order to recover a module experiencing errors
 * @memberof module:Recovery
 */

/**
 * Maps a service name to a {Recovery} that allows a module to resume normal operations after experiencing errors
 * @typedef {Object.<String, Recovery>} StrategyMap
 * @property {String} - an existing service with a recovery configuration
 * @memberof module:Recovery
 */

/**
 * Instruments recovery strategies for client-defined modules that are experiencing repeated errors.
 * _Methods referenced below are exposed on the application core under `sandbox.my.recovery` namespace._
 * @param {Object} sandbox - default sandboxed APIs
 * @module Recovery
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
     * @memberof module:Recovery
     * @returns {Object}
     */
    function getAllStrategies() {
        return strategyMap;
    }

    /**
     * Adds a recovery function to a list of possible strategies for recovering a module experiencing errors
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     * @memberof module:Recovery
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
     * @memberof module:Recovery
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
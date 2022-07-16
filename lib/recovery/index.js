import Strategy from './strategy.js';
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
        const moduleName = appEvent.payload();

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
            strategyMap['lastAttemptedStrategy'] = currentStrategyName;
            recoverModule();

            //We have to wrap this in a timeout: lastAttemptedStrategyStatus = null;
        } catch (e) {
            console.error(`RecoveryError.StrategyError => Recovery strategy (${currentStrategyName}) threw an error: (${e.message}) See ./lib/recovery/index.js`);
        }
    }
}
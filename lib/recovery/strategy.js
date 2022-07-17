const defaultRecoveryStrategy = () => { };

/**
 * Configures a strategy enabling a module experiencing errors to attempt to recover itself
 * @typedef {Object} StrategyConfiguration
 * @property {Object} console - an instance of the {Console} interface
 * @property {Function} fn - the logic the recovery strategy will execute upon a recovery attempt
 * @property {String} name - the name of the strategy
 */

/**
 * A recovery procedure for a client-defined module
 * @param {StrategyConfiguration} config - an instance of the {StrategyConfiguration} interface
 * @returns {Object} 
 */
export default function Strategy({
    console,
    fn,
    name
}) {
    let attemptCount = 0;
    let lastAttemptTimeStamp = new Date().toISOString();

    if (typeof (fn) !== 'function') {
        console.error(`StrategyError.BadRequest => Cannot create strategy (${name}): 'fn' argument should be of type {Function}, not (${typeof fn}).`);
        return {
            getName,
            getStats,
            fn: defaultRecoveryStrategy,
        }
    }

    /**
     * Gets the name of the current strategy
     * @returns {String} - the strategy name
     */
    function getName() {
        return name;
    }

    /**
     * @returns {Object}
     */
    function getStats() {
        return {
            attemptCount,
            lastAttemptTimeStamp
        }
    }

    /**
     * Executes the recovery procedure
     */
    function run() {
        attemptCount += 1;
        lastAttemptTimeStamp = new Date().toISOString();
        fn();
    }


    return {
        getName,
        getStats,
        run,
    };
}
const defaultRecoveryStrategy = () => { };

/**
 * A recovery configuration for a client-defined module
 * @param console
 * @param fn
 * @param name
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
     * Executes the recovery strategy
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
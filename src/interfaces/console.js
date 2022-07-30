/* istanbul ignore file */

/**
 * An object having the IConsole API; a set of methods for
 * managing log messages
 * @typedef {Object} IConsole
 * @property {Function} assert - prints assertion failure messages
 * @property {Function} error - prints error messages
 * @property {Function} info - prints informational messages
 * @property {Function} log - prints simple messages
 */

/**
 * Interface for console
 * @param {IConsole} myImpl - object defining concrete implementations for interface methods
 */

 function IConsole(myImpl = {}) {
    function required() {
        throw Error('Missing implementation');
    }

    return {
        assert: myImpl.assert || required,
        error: myImpl.error || required,
        info: myImpl.info || required,
        log: myImpl.log || required,
        warn: myImpl.warn || required
    };
}

export { IConsole };
/* istanbul ignore file */

/**
 * An object having the IConsole API; a set of methods for
 * managing posts in the datastore
 * @typedef {Object} IConsole
 * @property {Function} error - finds all Posts in the data store
 * @property {Function} info - finds a Post in the data store by uuid
 * @property {Function} log - creates a new Post in the data store
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
        error: myImpl.error || required,
        info: myImpl.info || required,
        log: myImpl.log || required,
    };
}

export { IConsole };
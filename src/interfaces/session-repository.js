/* istanbul ignore file */

/**
 * An object having the ISessionRepository API; a set of methods for
 * managing `Sessions` in the datastore
 * @typedef {Object} ISessionRepository
 * @property {Function} create - creates a new `Session` in the data store
 * @property {Function} expireSession - ends an active session
 */ 

/**
 * Interface for a repository of `Session`
 * @param {ISessionRepository} myImpl - object defining concrete implementations for interface methods
 */

 function ISessionRepository(myImpl = {}) {
  function required() {
    throw Error('Missing implementation');
  }

  return {
    create: myImpl.create || required,
    expireSession: myImpl.expireSession || required,
  };
}

export default ISessionRepository;
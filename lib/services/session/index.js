import ISessionRepository from '../../../src/interfaces/session-repository.js';

/**
 * Provides methods for auditing user sesssions. 
 * _Methods referenced below are exposed on the application core under `sandbox.my.sessionService` namespace._
 * @module SessionService
 * @param {Object} sandbox - default sandboxed APIs
 */
 export default function SessionService(sandbox) {
  const { ApplicationError } = sandbox.get('errors');
  const console = sandbox.get('console');
  let myRepository = ISessionRepository();

  /**************** PUBLIC API ****************/
  sandbox.put('sessionService', {
    create,
    expire,
    setRepository
  });

  /**************** METHODS ****************/

  /**
   * @param {String} expiryDate - the date/time a `Session` and associated authorization token will expired
   * @param {Boolean} isExpired - indicates the current `Session` is expired
   * @param {String} token - authorization token associated with a `Session`
   * @param {String} userId - userId to associate with a `Session`
   * @memberof module:SessionService
   * @returns {Object} - a new `Session`
   */
  async function create(sessionConfig) {
    return myRepository.create(sessionConfig); 
  }

  /**
   * @param {String} sessionId - unique identifier for an existing session
   */
  async function expire(sessionId) {
    return myRepository.expireSession(sessionId); 
  }

  /**
   * @param {Object} repo - an object having the {ISessionRepository} interface 
   * @memberof module:SessionService
   * @returns {Boolean}
   */
  function setRepository(repo) {
    if (!repo) {
      console.error(ApplicationError({
        code: 'client.error',
        message: 'SessionServiceError.BadRequest.CannotSetRepository => (repo) is undefined',
        name: 'LibSessionServiceError',
        module: '/lib/services/session',
      }));

      return false;
    }

    myRepository = ISessionRepository(repo);
    return true;
  }
}
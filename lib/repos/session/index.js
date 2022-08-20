import UUID from '../../../src/utils/id.js';

/**
 * Creates a valid `Session` ready to be committed to the datastore
 * @param {String} id - unique id for `Session`
 * @param {String} userId - unique id for `User`
 * @param {String} token - authorization token for a `User`
 * @param {String} createdAt - date authorization token was created
 * @param {String} expiryDate - date authorization token expires
 * @param {Boolean} isExpired - indicates whether the token is currently expired
 * @memberof module:Repository/Session
 * @returns {Object}
 */
 function SessionDocument({
  id = `/sessions/${UUID()}`,
  userId,
  token,
  expiryDate,
  isExpired = false,
  createdAtTimestamp = new Date().toISOString(),
}) {

  return {
    id,
    userId,
    token,
    expiryDate,
    isExpired,
    createdAtTimestamp,
  }
}

/**
 * Exposes API for managing `Session` instances.
 * @param {Object} sandbox - sandboxed module APIs
 * @module Repository/Session
 */

export default function (sandbox) {
  const database = sandbox.get('database');

  /**************** PUBLIC API ****************/
  sandbox.put('sessionRepo', {
    create,
    expireSession,
  });

  /**
   * Creates a new `Session` 
   * @param {String} id - id of the new `Session`
   * @param {String} token - token associated with the `Session` instance
   * @param {String} expiryDate - date the token expires
   * @param {Boolean} expired - indicates whether token has expired
   * @memberof module:Repository/Session
   * @returns {Object}
  */
  async function create(data) {
    const document = SessionDocument(data);
    const [session] = await database.putOne({ doc: document, collection: 'sessions' });
    return session;
  }

  /**
   * Closes an active `Session` 
   * @param {String} id - id of the `Session`
   * @memberof module:Repository/Session
   * @returns {Object}
  */
   async function expireSession(id) {
    const [currentSession] = await database.findOne({id, collection: 'sessions'});
    const document = SessionDocument(Object.assign(currentSession, { isExpired: true }));
    const [expiredSession] = await database.updateOne({ doc: document, collection: 'sessions' });

    return expiredSession;
  }

}
/**
 * Creates a valid `Session` ready to be committed to the datastore
 * @param {String} id - unique id for `Session`
 * @param {String} token - authorization token for a user
 * @param {String} createdAt - date authorization token was created
 * @param {String} expiryDate - date authorization token expires
 * @param {Boolean} expired - indicates whether the token is currently expired
 * @memberof module:Repository/Session
 * @returns {Object}
 */
 function SessionDocument({
  id,
  token,
  expired,
  expiryDate,
  createdAt = new Date().toISOString(),
}) {

  return {
    id,
    token,
    expired,
    expiryDate,
    createdAt,
  }
}

/**
 * Exposes API for managing `Session` instances.
 * @param {Object} sandbox - sandboxed module APIs
 * @module Repository/Session
 */

export default function (sandbox) {

  /**************** PUBLIC API ****************/
  sandbox.put('sessionRepo', {
    create,
    expire,
    findSessionByCredential
  });

  /**
   * Creates a new `Session` 
   * @param {String} id - id of the new `Session`
   * @param {String} token - token associated with the `Session` instance
   * @param {String} expiryDate - date the token expires
   * @param {Boolean} expired - indicates whether token has expired
   * @returns {Object}
  */
  async function create(data) {
    const document = SessionDocument(data);
    const [session] = await database.putOne({ doc: document, collection: 'sessions' });
    return session;
  }

  /**
   * Expires an existing active `Session`
   * @param {String} token - existing authorization token
   * @returns {String} - the expired token 
   */
  async function expire(token) {
    const session = await findSessionByCredential(token);

    if (session) {
      await database.updateOne({ doc: Object.assign(session, { expired: true }), collection: 'sessions' });
      return session.token;
    }
  }

  /**
   * Gets an existing `Session`
   * @param {String} token - existing authorization credential
   * @returns {Object}
   */
   async function findSessionByCredential(token) {
    const allSessions = await database.findAll('sessions');
    const session = allSessions.find((s)=> {
      return s.token === token;
    });

    return session;
  }
}
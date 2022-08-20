import jwt from 'jsonwebtoken';

const expiredCredentials = new Set();

/**
 *  Manages creation and lifecycle of user *authentication* credentials
 * _Methods referenced below are exposed on the application core under `sandbox.my.userAuthn` namespace._
 * @module Plugin/UserAuthn
 * @param {Object} sandbox - default sandboxed APIs
 */
 export default function PluginAuthn(sandbox) {
  const { ApplicationError } = sandbox.get('errors');

  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/user-authn',
  });

  /**************** PLUGIN DEFINTION ****************/

  /**
   * Loads the plugin
   * @param {Object} sessionService 
   * @memberof module:Plugin/UserAuthn
   * @returns {Object}
   */
  function myPlugin({ JWT_SECRET }, sessionService) {
    /**
     * Issues a new authorization credential for a specified user
     * @param {User} user - an instance of the User class
     * @param {String} role - role associated with the user in the datastore
     * @memberof module:Plugin/UserAuthn
     * @returns a JSON Web Token
    */
    async function issueAuthnCredential(user, role = 'user') {
      const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
      const { id: sessionId } = await sessionService.create({ expiryDate: expiresInOneHour, userId: user.id });
      const token = jwt.sign({
        iss: 'api@sandbox',
        exp: expiresInOneHour,
        sub: user.id,
        sid: sessionId,
        role: [role],
      }, JWT_SECRET);
      
      // We want to ensure that session expiration occurs in parallel with token expiry automatically
      setTimeout(() => sessionService.expireAuthnCredential(token), expiresInOneHour);

      return token;
    };

    /**
     * Adds a credential to a list of burned *authorization* credentails; expires associated session 
     * @param {String} credential - a JSON Web Token
     * @memberof module:Plugin/UserAuthn
     * @returns {Boolean}
    */
    async function expireAuthnCredential(credential) {
      const { sid: sessionId } = jwt.decode(credential);
      expiredCredentials.add(credential);
      await sessionService.expire(sessionId);
      return true;
    };
    
    /**
     * @param {String} credential - a JSON Web Token
     * @memberof module:Plugin/UserAuthn
     * @returns {Boolean} indicating whether the *authorization* credential is valid
    */
    function validateAuthnCredential(credential) {
      try {
        if (jwt.verify(credential, JWT_SECRET) && (!expiredCredentials.has(credential))) {
          return true;
        }
        return false;
      } catch(e) {
        return false;
      }
    };

    return {
      expireAuthnCredential,
      issueAuthnCredential,
      validateAuthnCredential
    }
  }
}
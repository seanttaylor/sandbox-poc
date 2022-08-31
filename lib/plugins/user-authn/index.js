import jwt from 'jsonwebtoken';
import GUID from '../../../src/utils/id.js';

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
  function myPlugin({ JWT_SECRET, JWT_TOKEN_EXPIRATION }, sessionService) {
    /**
     * Issues a new authorization credential for a specified user
     * @param {User} user - an instance of `User` 
     * @param {String} role - role to associate with the `User`
     * @memberof module:Plugin/UserAuthn
     * @returns {String} a JSON Web Token
    */
    // Reason: Juice not worth the squeeze testing whether the Node runtime actually creates default params
    /* istanbul ignore next  */
    async function issueAuthnCredential({ user, role = 'user' }) {
      const token = jwt.sign({
        iss: 'api@sandbox',
        exp: JWT_TOKEN_EXPIRATION,
        sub: user.id,
        sid: `/sessions/${GUID()}`,
        role: [role],
      }, JWT_SECRET);
      
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
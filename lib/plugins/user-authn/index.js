import jwt from 'jsonwebtoken';
import UUID from '../../../src/utils/id.js';
//const expiredCredentials = new Set();

/**
 *  Manages creation and lifecycle of user *authentication* credentials
 * _Methods referenced below are exposed on the application core under `sandbox.my.userAuthn` namespace._
 * @module UserAuthnService
 * @param {Object} sandbox - default sandboxed APIs
 */
 export default function UserAuthnService(sandbox) {
  const { ApplicationError } = sandbox.get('errors');

  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/user-authn',
  });

  /**************** PLUGIN DEFINTION ****************/

  /**
   * Loads the plugin
   * @param {Object} sessionRepo 
   * @memberof module:Plugin/UserAuthn
   * @returns {Object}
   */
  function myPlugin(sessionRepo) {
    /**
     * Issues a new authorization credential for a specified user
     * @param {User} user - an instance of the User class
     * @param {String} role - role associated with the user in the datastore
     * @memberof module:UserAuthnService
     * @returns a JSON Web Token
    */
    async function issueAuthnCredential(user, role = 'user') {
      const expired = false;
      const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
      const token = jwt.sign({
        iss: 'api@sandbox',
        exp: expiresInOneHour,
        sub: user.id,
        role: [role],
      }, process.env.JWT_SECRET);
      
      await sessionRepo.create({ expiryDate: expiresInOneHour, id: UUID(), token, expired });

      return token;
    };

    /**
     * Expires an existing *authorization* credential
     * @param {String} credential - a JSON Web Token
     * @memberof module:UserAuthnService
     * @returns {Boolean}
    */
    async function expireAuthnCredential(credential) {
      return sessionRepo.expire(credential);
      // expiredCredentials.add(credential);
      //return true;
    };
    
    /**
     * @param {String} credential - a JSON Web Token
     * @memberof module:UserAuthnService
     * @returns {Boolean} indicating whether the *authorization* credential is valid (i.e. not expired)
    */
    async function validateAuthnCredential(credential) {
      const session = await sessionRepo.findSessionByCredential(credential);
      if (session && (!session.expired)) {
        return true;
      } 

      return false;
      
      //return !expiredCredentials.has(credential);
    };

    return {
      expireAuthnCredential,
      issueAuthnCredential,
      validateAuthnCredential
    }
  }

}
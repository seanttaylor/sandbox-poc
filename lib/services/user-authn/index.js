import jwt from 'jsonwebtoken';

const expiredCredentials = new Set();

/**
 *  Manages creation and lifecycle of user *authentication* credentials
 * _Methods referenced below are exposed on the application core under `sandbox.my.userAuthn` namespace._
 * @module UserAuthnService
 * @param {Object} sandbox - default sandboxed APIs
 */
 export default function UserAuthnService(sandbox) {
  const { ApplicationError } = sandbox.get('errors');
  const events = sandbox.get('/plugins/events-authz');
  const subscriberId = 'userAuthn';

  /**************** PUBLIC API ****************/
  sandbox.put('userAuthn', {
    expireAuthnCredential,
    issueAuthnCredential,
    validateAuthnCredential
  });

  /**************** METHODS ****************/
  
  /**
   * Issues a new authorization credential for a specified user
   * @param {User} user - an instance of the User class
   * @param {String} role - role associated with the user in the datastore
   * @memberof module:UserAuthnService
   * @returns a JSON Web Token
  */

  function issueAuthnCredential(user, role = 'user') {
    const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
    const token = jwt.sign({
      iss: 'api@sandbox',
      exp: expiresInOneHour,
      sub: user.id,
      role: [role],
    }, process.env.JWT_SECRET);
   
    return token;
  };

  /**
   * Expires an existing *authorization* credential
   * @param {String} credential - a JSON Web Token
   * @memberof module:UserAuthnService
   * @returns {Boolean}
  */

  function expireAuthnCredential(credential) {
    expiredCredentials.add(credential);
    return true;
  };
  
  /**
   * @param {String} credential - a JSON Web Token
   * @memberof module:UserAuthnService
   * @returns {Boolean} indicating whether the *authorization* credential is valid (i.e. not expired)
  */
  
  function validateAuthnCredential(credential) {
    return !expiredCredentials.has(credential);
  };

}
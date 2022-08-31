/* istanbul ignore file */

/**
 * An object having the IUserService API; a set of methods for managing `User` instances
 * @typedef {Object} IUserService
 * @property {Function} create - creates a new `User` instance
 * @property {Function} createUserPassword - creates a new password for a `User`
 * @property {Function} deleteUser - deletes an existing `User` instance
 * @property {Function} editEmailAddress - update an existing `User` email address
 * @property {Function} editName - update an existing `User` name
 * @property {Function} editMotto - update an existing `User` motto
 * @property {Function} emailAddressExists - verify an email address exists
 * @property {Function} getUserByEmail - fetch a specified `User` instance by email
 * @property {Function} getUserById - fetch a `User` instance by id
 * @property {Function} getAllUsers - fetch all `User` instances
 * @property {Function} validateUserPassword - validate a `User` password
 * @property {Function} resetUserPassword - reset a `User` password
 * @property {Function} setRepository - associate the service with a specified repository
 * @property {Function} userExists - verify a `User` instance exists
 */

/**
 * Interface for a service that manages `Users`
 * @param {IUserService} myImpl - object defining concrete implementations for interface methods
 */

function IUserService(myImpl = {}) {
  function required() {
    throw Error('Missing implementation');
  }

  return {
    create: myImpl.create || required,
    createUserPassword: myImpl.createUserPassword || required,
    deleteUser: myImpl.deleteUser || required,
    editEmailAddress: myImpl.editEmailAddress || required,
    editName: myImpl.editName || required,
    editMotto: myImpl.editMotto || required,
    emailAddressExists: myImpl.emailAddressExists || required,
    getUserByEmail: myImpl.getUserByEmail || required,
    getUserById: myImpl.getUserById || required,
    getAllUsers: myImpl.getAllUsers || required,
    getErrorResponse: myImpl.getErrorResponse || required,
    login: myImpl.login || required,
    resetUserPassword: myImpl.resetUserPassword || required,
    setRepository: myImpl.setRepository || required,
    userExists: myImpl.userExists || required,
    validateUserPassword: myImpl.validateUserPassword || required,
  };
}

export default IUserService;

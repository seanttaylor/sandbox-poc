/* istanbul ignore file */

/**
 * An object having the IUserRepository API; a set of methods for
 * managing Users in the datastore
 * @typedef {Object} IUserRepository
 * @property {Function} create
 * @property {Function} editEmailAddress
 * @property {Function} editName
 * @property {Function} editMotto
 * @property {Function} emailAddressExists
 * @property {Function} getUserByEmail
 * @property {Function} getUserCredentialByEmail
 * @property {Function} getUserById
 */

/**
 * Interface for a repository of Users
 * @param {IUserRepository} myImpl - object defining concrete implementations for interface methods
 */

 function IUserRepository(myImpl = {}) {
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
    exists: myImpl.exists || required,
    getUserByEmail: myImpl.getUserByEmail || required,
    getUserCredentialByEmail: myImpl.getUserCredentialByEmail || required,
    getAllUsers: myImpl.getAllUsers || required,
    getUserById: myImpl.getUserById || required,
    resetUserPassword: myImpl.resetUserPassword || required
  };
}

export default IUserRepository;

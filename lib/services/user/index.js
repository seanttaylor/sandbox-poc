import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { promisify } from 'util';
import IUserRepository from '../../../src/interfaces/user-repository.js';

const hash = promisify(bcrypt.hash);
const passwordAndHashMatch = promisify(bcrypt.compare);
const SALT_ROUNDS = 10;

/**
 * 
 * @param {Any} data 
 */
function ServiceResponse(data) {
  if (!data) {
    return {
      data: [],
      entries: 0
    }
  };

  const dataIsList = Array.isArray(data);
  const count = dataIsList ? data.length : 1;

  return {
    data: dataIsList ? data : [data],
    entries: count 
  }
}

/**
 * Provides CRUD methods for `Users` and for managing the datastore associated with `Users`. 
 * _Methods referenced below are exposed on the application core under `sandbox.my.userService` namespace._
 * @module UserService
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function UserService(sandbox) {
  const { ApplicationError } = sandbox.get('errors');
  let myRepository = IUserRepository();

  /**************** PUBLIC API ****************/
  sandbox.put('userService', {
    create,
    createUserPassword,
    deleteUser,
    editEmailAddress,
    editName,
    editMotto,
    emailAddressExists,
    getUserByEmail,
    getUserById,
    getAllUsers,
    getUserById,
    getUserRole,
    isUserPasswordCorrect,
    resetUserPassword,
    setRepository,
    userExists,
  });

  /**************** METHODS ****************/
   
  /**
   * @param {String} id
   * @param {String} emailAddress
   * @param {String} firstName
   * @param {String} handle
   * @param {String} lastName 
   * @param {String} motto 
   * @param {String} password
   * @memberof module:UserService
   * @returns {Object}
  */  
  async function create({ id=`/users/${randomUUID()}`, emailAddress, firstName, handle, lastName, motto, password }) {
    const record = await myRepository.create({ id, emailAddress, firstName, handle, lastName, motto, password });
    return ServiceResponse(record);
  };

  /**
   * 
   * @param {String} id 
   * @memberof module:UserService
   * @returns {Object}
  */
  async function getUserById(id) {
    const record =  await myRepository.findOneById(id);
    return ServiceResponse(record);
  };

  /**
   * 
   * @param {String} emailAddress 
   * @memberof module:UserService
   * @returns {Object}
   */
  async function getUserByEmail(emailAddress) {
    const record = await myRepository.findOneByEmail(emailAddress);
    return ServiceResponse(record);
  };

  /**
   * 
   * @memberof module:UserService
   * @returns {Array}
   */
  async function getAllUsers() {
    const recordList = await myRepository.findAll();
    return ServiceResponse(recordList);
  };

  /**
   * 
   * @param {Strgin} id 
   * @memberof module:UserService
   * @returns {Object}
   */
  async function deleteUser(id) {
    const result = await myRepository.deleteUser(id);
    return ServiceResponse(result);
  };

  /**
   * 
   * @param {String} id 
   * @memberof module:UserService
   * @returns {Object}
   */
  async function userExists(id) {
    const result = await myRepository.exists(id);
    return ServiceResponse(result);
  };

  /**
   * 
   * @param {String} emailAddress 
   * @memberof module:UserService
   * @returns {Object}
   */
  async function emailAddressExists(emailAddress) {
    const result = await myRepository.emailAddressExists(emailAddress);
    return ServiceResponse(result);
  };

  /**
   * @param {String} id
   * @param {String} emailAddress 
   * @memberof module:UserService
   * @returns {Object}
   */
   async function editEmailAddress({ id, emailAddress }) {
    const record = await myRepository.editEmailAddress({ id, emailAddress });
    return ServiceResponse(record);
  };

  /**
   * @param {String} id
   * @param {String} motto 
   * @memberof module:UserService
   * @returns {Object}
   */
   async function editMotto({ id, motto }) {
    const record = await myRepository.editMotto({ id, motto });
    return ServiceResponse(record);
  };

  /**
   * @param {String} id
   * @param {String} name 
   * @memberof module:UserService
   * @returns {Object}
   */
   async function editName({ id, name }) {
    const record = await myRepository.editName({ id, name });
    return ServiceResponse(record);
  };

  /**
   * Creates a new user password
   * @param {String} password
   * @param {Object} user
   * @memberof module:UserService
   */
  async function createUserPassword({ password, user }) {
    const passwordHash = await hash(password, SALT_ROUNDS);
    const record = await myRepository.createUserPassword(({
      id: `/credentials/${randomUUID()}`,
      emailAddress: user.emailAddress,
      password: passwordHash,
      userId: user.id,
    }));

    return ServiceResponse(record);
  };

  /**
   * Verifies a user a password
   * @param {String} emailAddress 
   * @param {String} password
   * @memberof module:UserService
   * @returns 
   */
  async function isUserPasswordCorrect({ emailAddress, password }) {
    const { password: storedUserPasswordHash } = await myRepository.getUserCredentialByEmail(emailAddress);
    const result = await passwordAndHashMatch(password, storedUserPasswordHash);
    return ServiceResponse({ isValid: result });
  };

  /**
   * Fetches the organization role for a specified `User`
   * @param {String} id
   * @memberof module:UserService
   * @returns {Object}
   */
  async function getUserRole(id) {
    const result = await myRepository.getUserRole(id);
    return ServiceResponse(result.role, count);
  };

  /**
   * Resets a specified user password
   * @param {Object} user
   * @param {String} password 
   * @memberof module:UserService
   */
  async function resetUserPassword({ password, user }) {
    // Eventually logic will be included to:
    // * Trigger an email to a user
    // * Fire this function when a form is submitted with a valid CSRF token that has not expired
    const passwordHash = await hash(password, SALT_ROUNDS);
    await myRepository.resetUserPassword({ password: passwordHash, user });
  };

  /**
   * 
   * @param {Object} repo
   * @memberof module:UserService
   */
  async function setRepository(repo) {
    myRepository = repo;
  };
}
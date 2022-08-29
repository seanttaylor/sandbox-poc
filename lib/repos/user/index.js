/* istanbul ignore file */

import user from "../../../schemas/user";

const SCHEMA_VERSION = '0.0.1';

/**
 * Creates a valid `User` ready to be committed to the datastore
 * @param {String} id - unique id for `User`
 * @param {String} firstName - unique id or the author of a `Post`
 * @param {String} lastName - handle of the author of a `Post`
 * @param {String} handle - display name of the author of a `Post`
 * @param {String} motto - unique id for this `Post` in the Write-Ahead Log
 * @param {String} emailAddress - body content of the `Post`
 * @param {String} password - list of unique id of `Comments` on the `Post`
 * @param {String} createdAt - date `Post` was created 
 * @param {String} lastModified - date `Post` was last updated
 * @param {String} schemaURL - the URL to the JSON Schema document for this `Post` version
 * @param {String} schemaVersion - the version number of the schema this `Post` conforms to 
 * @memberof module:Repository/User
 * @returns {Object}
 */
function UserDocument({
  id,
  firstName,
  lastName,
  handle,
  motto,
  emailAddress,
  password,
  createdAt = new Date().toISOString(),
  lastModified = null,
  isVerified = false,
  schemaURL = `${process.env.SCHEMA_BASE_URL}/user/${SCHEMA_VERSION}/user.json`,
  schemaVersion = SCHEMA_VERSION
}) {

  return {
    id,
    firstName,
    lastName,
    handle,
    motto,
    emailAddress,
    password,
    createdAt,
    lastModified,
    isVerified,
    schemaURL,
    schemaVersion
  }
}


/**
 * Creates a valid `UserRole` ready to be committed to the datastore
 * @param {String} id - unique id for `User`
 * @param {String} createdAt - date `UserRole` instance was created 
 * @param {String} lastModified - date `UserRole` was last updated
 * @param {String} schemaURL - the URL to the JSON Schema document for this `UserRole` version
 * @param {String} schemaVersion - the version number of the schema this `UserRole` conforms to 
 * @memberof module:Repository/User
 * @returns {Object}
 */
 function UserRoleDocument({
  id,
  role = user,
  createdAt = new Date().toISOString(),
  lastModified = null,
  schemaURL = `${process.env.SCHEMA_BASE_URL}/user/${SCHEMA_VERSION}/user-role.json`,
  schemaVersion = SCHEMA_VERSION
}) {

  return {
    id,
    role,
    createdAt,
    lastModified,
    schemaURL,
    schemaVersion
  }
}

/**
 * Creates a valid `UserCredential` ready to be committed to the datastore
 * @param {String} id - uuid f
 * @param {String} emailAddress - email address for a user
 * @param {String} password - user password hash
 * @param {String} createdDate - date the user credential was created
 * @param {String|null} lastModified - date the user credential was last modified
 * @returns {UserCredentialDocument}
*/

function UserCredentialDocument({
  id, userId, emailAddress, password, createdAt = new Date().toISOString(), lastModified = null,
}) {
  return  {
    id,
    userId,
    emailAddress,
    password,
    createdAt,
    lastModified,
  };
}

export default function(sandbox) {
  const database = sandbox.get('database');

  /**************** PUBLIC API ****************/
  sandbox.put('userRepo', {
    create,
    createUserPassword,
    deleteUser,
    editEmailAddress,
    editName,
    editMotto,
    emailAddressExists,
    exists,
    findOneById,
    findOneByEmail,
    findAll,
    getUserCredentialByEmail,
    getUserRoleById,
    resetUserPassword
  });

  /**************** METHODS ****************/

  /**
   * Creates a new `User` instance
   * @returns {UserDocument}
   */
  async function create(data) {
    const document = UserDocument(data);
    const [record] = await database.putOne({
      doc: document,
      collection: 'users',
    });

    return UserDocument(record);
  };

  
  /**
   * Fetches a specified `User` instance 
   * @param {String} id - uuid for a user
   * @return {Object}
   */
  async function findOneById(id) {
    // We don't return an instance of `UserDocument` here because calls to the function originating from this module
    // expect `undefined` if `User` is not found rather than a `UserDocument`; `UserDocument also breaks
    const [record] = await database.findOne({ id, collection: 'users' });
    return record;
  };

  /**
   * @param {String} emailAddress - `User` email address
   * @returns {Object}
   */
  async function findOneByEmail(emailAddress) {
    // We don't return an instance of `UserDocument` here because calls to the function originating from this module
    // expect `undefined` if `User` is not found rather than a `UserDocument`; `UserDocument also breaks
    const result = await database.findAll('users');
    return result.find((u) => u.emailAddress === emailAddress);
  };

  /**
   * Fetches all `User` instances in the datastore
   * @returns {Array}
   */
  async function findAll() {
    const recordList = await database.findAll('users');
    return recordList.map((r) => UserDocument(r));
  };

  /**
   * @param {String} id - uuid of the `User`
   * @param {Object} name - an object containing `firstName` and `lastName` properties
   * @returns {Object}
   */
  async function editName({ id, name }) {
    const record = await findOneById(id);
    const { firstName=record.firstName, lastName=record.lastName } = name;
    const [updatedRecord] = await database.updateOne({
      doc: Object.assign(record, { firstName, lastName }),
      collection: 'users',
    });

    return UserDocument(updatedRecord);
  };

  /**
   * @param {String} id - uuid of the `User`
   * @param {String} motto - the updated `User` motto
   * @returns {Object}
   */
  async function editMotto({ id, motto }) {
    const record = await findOneById(id);
    const [updatedRecord] = await database.updateOne({
      doc: Object.assign(record, {motto}),
      collection: 'users',
    });

    return UserDocument(updatedRecord);
  };

  /**
   * @param {String} id - uuid of the `User`
   * @param {String} emailAddress - the updated user email address
   * @returns {Object}
   */
  async function editEmailAddress({ id, emailAddress }) {
    const record = await findOneById(id);
    const [updatedRecord] = await database.updateOne({
      doc: Object.assign(record, { emailAddress }),
      collection: 'users',
    });

    return UserDocument(updatedRecord);
  };

  /**
   * @param {String} emailAddress - a `User` email address
   * @returns {Object}
   */
  async function emailAddressExists(emailAddress) {
    const record = await findOneByEmail(emailAddress);
    return {
      exists: record ? true : false,
      record: record || null
    }
  };

  /**
   * @param {String} id - uuid of a `User`
   * @returns {Object}
   */
   async function exists(id) {
    const record = await findOneById(id);
    return {
      exists: record ? true : false,
      record: record || null
    }
  };

  /**
   * @param {String} id - uuid of the `User`
   * @returns {Object}
   */
   async function deleteUser(id) {
    const record = await database.removeOne({ id, collection: 'users' });
    return record;
  };

  /**
   * @param {String} emailAddress - email address of the `User` 
   * @param {String} password - password for the `User`
   * @param {String} userId - uuid of the `User`
   * @returns {Object}
   */
  async function createUserPassword(credentialConfig) {
    const [record] = await database.putOne({ 
      doc: UserCredentialDocument(credentialConfig),
      collection: 'user_credentials' 
    });
    
    return UserCredentialDocument(record);
  };

  /**
   * Resets the password of an existing `User`
   * @param {String} emailAddress - email address of the `User` 
   * @param {String} password - password for the `User`
   * @param {String} userId - uuid of the `User``User`
   * @returns {UserCredentialDocument}
   */
   async function resetUserPassword(credentialConfig) {
    const { user , password } = credentialConfig;
    const credential = await getUserCredentialByEmail(user.emailAddress);
    const updatedCredential = await database.updateOne({ 
      doc: UserCredentialDocument(Object.assign(credential, { password })),
      collection: 'user_credentials' 
    });

    return UserCredentialDocument(updatedCredential);
  };

  /**
   * @param {String} emailAddress - email address of the `User` 
   * @returns {UserCredentialDocument}
   */
  async function getUserCredentialByEmail(emailAddress) {
    const recordList = await database.findAll('user_credentials');
    const record = recordList.find((item)=> item.emailAddress === emailAddress);
    return UserCredentialDocument(record);
  };

  /**
   * Fetches a specified `Role` by guid
   * @param {String} id - guid of the role
   * @returns {UserRoleDocument}
   */
  async function getUserRoleById(id) {
    const recordList = await database.findAll('user_roles');
    const record = recordList.find((item)=> item.id === id);
    return UserRoleDocument(record);
  };
}
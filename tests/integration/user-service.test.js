
import { faker } from '@faker-js/faker';
import UserRepository from '../../lib/repos/user/index.js';
import UserService from '../../lib/services/user/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite tests the public methods the UserRepository API and client-defined Plugin intialization. 
 */
describe('UserService API', () => {
  // SandboxController augments sandbox with a method for registering the public API of application modules (e.g. the UserRepository module)
  const sandbox = {};
  const { controller } = SandboxController(sandbox);
  // The controller applies the API of the module to the sandbox
  UserRepository(controller);
  UserService(controller);

  test('Should be not be able to create a new `User` if repository has not been set', async () => {
    try { 
      const testUserData = {
        id: `/users/${faker.datatype.uuid()}`,
        emailAddress: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: faker.random.alpha(10),
        handle: `@${faker.random.alpha(10)}`,
        motto: `${faker.hacker.phrase()}`
      };

      const userService = sandbox.my.userService;
      const record = await userService.create(testUserData);
    } catch (e) {
      expect(e.message).toMatch('Missing implementation');
    }
  });

  test('Should be be able to create a new `User`', async () => {
   
    const testUserData = {
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);

    const response = await userService.create(testUserData);
    const [record] = response.data;

    expect(record.id).toBeTruthy();
    expect(typeof(record.createdAt) === 'string').toBe(true);

  });

  test('Should be be able to find an existing `User`', async () => {
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    
    const response = await userService.getUserById(id);
    const [record] = response.data;

    expect(record.id === id).toBe(true);
    expect(typeof(record.createdAt) === 'string').toBe(true);

  });

  test('Should be be able to find an existing `User` by email', async () => {
    const emailAddress = faker.internet.email();
    const testUserData = {
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    
    const response = await userService.getUserByEmail(emailAddress);
    const [record] = response.data;

    expect(record.emailAddress === emailAddress).toBe(true);
    expect(typeof(record.createdAt) === 'string').toBe(true);
  });

  test('Should be be able to get a list of all existing `User` instances', async () => {
    const testUserData = {
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    
    const response = await userService.getAllUsers();
    const recordList = response.data;

    expect(Array.isArray(recordList)).toBe(true);
    expect(recordList[0]['id']).toBeTruthy();
    expect(recordList.length > 1).toBe(true);
  });

  test('Should be be able to delete a `User` instances', async () => {
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    await userService.deleteUser(id);
    
    const response = await userService.getUserById(id);
    const [record] = response.data;
    
    expect(record).toBeFalsy();
  });

  test('Should be be able to determine whether a specified `User` instance exists', async () => {
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    
    const response1 = await userService.userExists(id);
    const [record1] = response1.data;

    const response2 = await userService.userExists('foo');
    const [record2] = response2.data;

    expect(record1.exists).toBe(true);
    expect(record2.exists).toBe(false);
  });

  test('Should be be able to determine whether a specified `User` email address exists', async () => {
    const emailAddress = faker.internet.email();
    const testUserData = {
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);

    await userService.create(testUserData);
    
    const response1 = await userService.emailAddressExists(emailAddress);
    const [record1] = response1.data;

    const response2 = await userService.userExists('foo@bar.com');
    const [record2] = response2.data;

    expect(record1.exists).toBe(true);
    expect(record2.exists).toBe(false);
  });

  test('Should be be able to update the email address of a specified `User`', async () => {
    const updatedEmailAddress = faker.internet.email();
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    await userService.editEmailAddress({ id, emailAddress: updatedEmailAddress });
    
    const response = await userService.getUserById(id);
    const [record] = response.data;

    expect(record.emailAddress === updatedEmailAddress).toBe(true);
  });

  test('Should be be able to update the name of a specified `User`', async () => {
    const updatedFirstname = faker.name.firstName();
    const updatedLastname = faker.name.lastName();
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    await userService.editName({ id, name: { firstName: updatedFirstname, lastName: updatedLastname }});
    
    const response = await userService.getUserById(id);
    const [record] = response.data;

    expect(record.firstName === updatedFirstname).toBe(true);
    expect(record.lastName === updatedLastname).toBe(true);
  });

  test('Should be be able to update the motto of a specified `User`', async () => {
    const updatedMotto = faker.hacker.phrase();
    const id = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    await userService.create(testUserData);
    await userService.editMotto({ id, motto: updatedMotto });
    
    const response = await userService.getUserById(id);
    const [record] = response.data;

    expect(record.motto === updatedMotto).toBe(true);
  });

  test('Should be be able to create a password for a specified `User`', async () => {
    const id = `/users/${faker.datatype.uuid()}`;
    const userPassword = faker.random.alpha(10);
    const emailAddress = faker.internet.email();
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    
    const response1 = await userService.create(testUserData);
    const [user] = response1.data;
    const response2 = await userService.createUserPassword({ user: { id, emailAddress }, password: userPassword });
  
    const [record] = response2.data;

    expect(typeof(record.password) === 'string').toBe(true);
    expect(record.userId === id).toBe(true);
  });

  test('Should be be able to verify a password for a specified `User`', async () => {
    const id = `/users/${faker.datatype.uuid()}`;
    const userPassword = faker.random.alpha(10);
    const emailAddress = faker.internet.email();
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    
    const response1 = await userService.create(testUserData);
    const [user] = response1.data;
    
    await userService.createUserPassword({ user: { id, emailAddress }, password: userPassword });
    
    const response2 = await userService.validateUserPassword({ emailAddress, password: userPassword });
    const [record2] = response2.data; 

    const response3 = await userService.validateUserPassword({ emailAddress, password: 'foo' });
    const [record3] = response3.data; 

    expect(record2.isValid).toBe(true);
    expect(record3.isValid).toBe(false);
  });

  test('Should be be able to reset a password for a specified `User`', async () => {
    const newUserPassword = faker.random.alpha(10);
    const id = `/users/${faker.datatype.uuid()}`;
    const userPassword = faker.random.alpha(10);
    const emailAddress = faker.internet.email();
    const testUserData = {
      id,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`
    };

    const userService = sandbox.my.userService;
    const userRepo = sandbox.my.userRepo;

    userService.setRepository(userRepo);
    
    await userService.create(testUserData);
    await userService.createUserPassword({ user: { id, emailAddress }, password: userPassword }); 
    await userService.resetUserPassword({ user: { id, emailAddress }, password: newUserPassword });
    
    const response = await userService.validateUserPassword({ emailAddress, password: newUserPassword });
    const [record] = response.data;
    
    expect(record.isValid).toBe(true);
  });
});
import { faker } from '@faker-js/faker';
import { describe, expect, test } from '@jest/globals';
import UserRepository from '../../lib/repos/user/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite tests the public methods the UserRepository API and client-defined Plugin intialization.
 */
describe('UserRepository API', () => {
  // SandboxController augments sandbox with a method for registering the public API of application modules (e.g. the UserRepository module)
  const sandbox = {};
  const { controller } = SandboxController(sandbox);
  // The controller applies the API of the module to the sandbox
  UserRepository(controller);

  test('Should be able to create a new `User`', async () => {
    const testUserData = {
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    };

    const record = await sandbox.my.userRepo.create(testUserData);

    expect(record.id).toBeTruthy();
    expect(typeof (record.id)).toEqual('string');
    expect(record.createdAt).toBeTruthy();
  });

  test('Should be able to retrieve an existing `User`', async () => {
    const testUserId = `/users/${faker.datatype.uuid()}`;
    const testUserData = {
      id: testUserId,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    };
    await sandbox.my.userRepo.create(testUserData);
    const record = await sandbox.my.userRepo.findOneById(testUserId);

    expect(record.id === testUserId).toBe(true);
  });

  test('Should be able to retrieve all existing `User` instances', async () => {
    const result = await sandbox.my.userRepo.findAll();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length > 0).toBe(true);
    expect(Object.keys(result[0]).includes('id')).toBe(true);
  });

  test('Should be able to update `User` first and/or last name', async () => {
    const testFirstnameEdit = 'Brucie';
    const record = await sandbox.my.userRepo.create({
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    });

    const updatedRecord = await sandbox.my.userRepo.editName({
      id: record.id,
      name: {
        firstName: testFirstnameEdit,
      },
    });

    expect(updatedRecord.firstName === testFirstnameEdit).toBe(true);
    expect(updatedRecord.lastModified).toBeTruthy();
  });

  test('Should be able to edit `User` motto', async () => {
    const record = await sandbox.my.userRepo.create({
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    });
    const updatedMotto = faker.hacker.phrase();

    const updatedRecord = await sandbox.my.userRepo.editMotto({
      id: record.id,
      motto: updatedMotto,
    });

    expect(record.id).toEqual(updatedRecord.id);
    expect(updatedRecord.motto).toEqual(updatedMotto);
  });

  test('Should be able to edit an existing `User` email address', async () => {
    const record = await sandbox.my.userRepo.create({
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    });
    const updatedEmailAddress = faker.internet.email();
    const updatedRecord = await sandbox.my.userRepo.editEmailAddress({ id: record.id, emailAddress: updatedEmailAddress });

    expect(record.id).toEqual(updatedRecord.id);
    expect(updatedRecord.emailAddress).toEqual(updatedEmailAddress);
  });

  test('Should be able to check if an email address exists in the data store', async () => {
    const record = await sandbox.my.userRepo.create({
      id: `/users/${faker.datatype.uuid()}`,
      emailAddress: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      password: faker.random.alpha(10),
      handle: `@${faker.random.alpha(10)}`,
      motto: `${faker.hacker.phrase()}`,
    });

    const exists = await sandbox.my.userRepo.emailAddressExists(record.emailAddress);
    expect(exists.record.emailAddress === record.emailAddress).toBe(true);

    const exists2 = await sandbox.my.userRepo.emailAddressExists(faker.internet.email());
    expect(exists2.record).toBe(null);
    expect(exists2.exists).toBe(false);
  });
});

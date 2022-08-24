
import { faker } from '@faker-js/faker';
import SessionRepository from '../../lib/repos/session/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite tests the public methods the SessionRepository API 
 */
describe('SessionRepository API', () => {
    // SandboxController augments sandbox with a method for registering the public API of application modules (e.g. the PostRepository module)
    const sandbox = {};
    const { controller } = SandboxController(sandbox);
    // The controller applies the API of the module to the sandbox
    SessionRepository(controller);

    test('Should be able to create a new `Session`', async () => {
      const authorId = "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d";
      const session = await sandbox.my.sessionRepo.create({
        token: 'fakeToken',
        expiryDate: new Date().getTime(),
        userId: authorId
      });

      expect(session.id).toBeTruthy();

      expect(typeof(session.id)).toEqual('string');
      expect(typeof(session.createdAt)).toEqual('string');
      expect(typeof(session.token)).toEqual('string');
    });

    test('Should be able to expire an existing `Session`', async () => {
      const authorId = "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d";
      const session = await sandbox.my.sessionRepo.create({
        token: faker.datatype.uuid(),
        expiryDate: new Date().getTime(),
        userId: authorId
      });

      const expiredSession = await sandbox.my.sessionRepo.expireSession(session.id);

      expect(expiredSession.isExpired).toBe(true);
    });
});
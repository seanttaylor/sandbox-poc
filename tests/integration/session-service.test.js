import { faker } from '@faker-js/faker';
import SessionRepository from '../../lib/repos/session/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';
import MockSandboxFactory from '../mocks/mock-sandbox-factory.js';
import SessionService from '../../lib/services/session/index.js';
import session from '../../lib/repos/session/index.js';

/**
 * This test suite verifies the Session Service functionality.
 */
describe('SessionService', () => {
  test('Should be able to create a new `Session`', async () => {
    const sandbox = {};
    const { controller } = SandboxController(sandbox);

    SessionRepository(controller);
    SessionService(controller);

    const sessionService = sandbox.my.sessionService;
    const sessionRepo = sandbox.my.sessionRepo;

    sessionService.setRepository(sessionRepo);

    const session = await sessionService.create({ 
      expiryDate: new Date().getTime(),
      isExpired: false, 
      token: `${faker.datatype.string(5)}`, 
      userId: '/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d' 
    });

    expect(typeof(session) === 'object').toBe(true);
  });

  test('Setting a invalid session repository should return false', async () => {
    const sandbox = {};
    const { controller } = SandboxController(sandbox);

    SessionRepository(controller);
    SessionService(controller);

    const sessionService = sandbox.my.sessionService;

    expect(sessionService.setRepository()).toBe(false);
  });

  test('Should be able to close an existing session', async () => {
    const sandbox = {};
    const { controller } = SandboxController(sandbox);

    SessionRepository(controller);
    SessionService(controller);

    const sessionService = sandbox.my.sessionService;
    const sessionRepo = sandbox.my.sessionRepo;

    sessionService.setRepository(sessionRepo);

    const { id: sessionId } = await sessionService.create({ 
      expiryDate: new Date().getTime(),
      isExpired: false, 
      token: `${faker.datatype.string(5)}`, 
      userId: '/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d' 
    });

    const expiredSession = await sessionService.expire(sessionId);

    expect(expiredSession.isExpired).toBe(true);
  });
});
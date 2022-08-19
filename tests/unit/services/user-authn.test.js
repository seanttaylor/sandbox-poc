import { faker } from '@faker-js/faker';
import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import UserAuthnService from '../../../lib/plugins/user-authn/index.js';

/**
 * This test suite verifies the User Authentication Service functionality.
 */
describe('UserAuthnService', () => {
  const mockSessionRepo = {
    create: jest.fn().mockImplementation(()=> 'fakeToken'),
    expire: jest.fn().mockImplementation(()=> true),
    findSessionByCredential: jest.fn().mockImplementation(()=> ({
      token: 'fakeToken',
      expired: false
    }))
  };

  test('Should register the UserAuthn API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();
    UserAuthnService(mockSandbox);

    expect(mockSandbox.plugin.mock.calls.length === 1).toBe(true);
    expect(typeof(mockSandbox.plugin.mock.calls[0][0]) === 'object').toBe(true);
    expect(typeof(mockSandbox.plugin.mock.calls[0][0]['fn']) === 'function').toBe(true);
    expect(mockSandbox.plugin.mock.calls[0][0]['name'] === '/plugins/user-authn').toBe(true);
  });

  test('Should be able to create a new user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    
    UserAuthnService(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential(mockUser);
    expect(typeof(credential) === 'string').toBe(true);
  });

  test('Should be able to expire an existing user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);
    
    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential(mockUser);
    const credentialExpired = await testPlugin.expireAuthnCredential(credential);

    expect(credentialExpired).toBe(true);
    expect(mockSessionRepo.expire.mock.calls[0][0] === credential).toBe(true);
  });

  test('Should be able to verify an existing user authentication credential is still valid', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential(mockUser);
    const isValidCredential = await testPlugin.validateAuthnCredential(credential);
    
    expect(isValidCredential).toBe(true);
  });

  test('Should be able to identify an existing user authentication credential that is INVALID', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    const altMockSessionRepo = Object.assign(mockSessionRepo, { 
      findSessionByCredential: jest.fn().mockImplementation(() => ({
        token: 'fakeToken',
        expired: true
      })) 
    });
    UserAuthnService(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential(mockUser);
    await testPlugin.expireAuthnCredential(credential);
    const isValidCredential = await testPlugin.validateAuthnCredential(credential);
    
    expect(isValidCredential).toBe(false);
  });
});
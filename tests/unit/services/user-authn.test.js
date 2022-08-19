import { faker } from '@faker-js/faker';
import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import UserAuthnService from '../../../lib/services/user-authn/index.js';

/**
 * This test suite verifies the User Authentication Service functionality.
 */
describe('UserAuthnService', () => {
  test('Should register the UserAuthn API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();
    UserAuthnService(mockSandbox);

    expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
    expect(mockSandbox.put.mock.calls[0][0] === 'userAuthn').toBe(true);
    expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('issueAuthnCredential')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('expireAuthnCredential')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('validateAuthnCredential')).toBe(true);
  });

  test('Should be able to create a new user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);

    const credential = mockSandbox.put.mock.calls[0][1]['issueAuthnCredential'](mockUser);
    expect(typeof(credential) === 'string').toBe(true);
  });

  test('Should be able to expire an existing user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);

    const credential = mockSandbox.put.mock.calls[0][1]['issueAuthnCredential'](mockUser);
    const credentialExpired = mockSandbox.put.mock.calls[0][1]['expireAuthnCredential'](credential);
    expect(credentialExpired).toBe(true);
  });

  test('Should be able to verify an existing user authentication credential is still valid', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);

    const credential = mockSandbox.put.mock.calls[0][1]['issueAuthnCredential'](mockUser);
    const isValidCredential = mockSandbox.put.mock.calls[0][1]['validateAuthnCredential'](credential);
    
    expect(isValidCredential).toBe(true);
  });

  test('Should be able to identify an existing user authentication credential that is invalid', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    UserAuthnService(mockSandbox);

    const credential = mockSandbox.put.mock.calls[0][1]['issueAuthnCredential'](mockUser);
    
    mockSandbox.put.mock.calls[0][1]['expireAuthnCredential'](credential);
    
    const isValidCredential = mockSandbox.put.mock.calls[0][1]['validateAuthnCredential'](credential);
    
    expect(isValidCredential).toBe(false);
  });
});
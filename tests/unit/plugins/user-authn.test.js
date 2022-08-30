// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import PluginUserAuthn from '../../../lib/plugins/user-authn/index.js';

/**
 * This test suite verifies the UserAuthn Plugin functionality.
 */
describe('PluginUserAuthn', () => {
  const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
  const mockSessionRepo = {
    create: jest.fn().mockImplementation(()=> ({
      "id": "/sessions/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09",
      "userId": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      "expiryDate": "2022-06-26T14:24:04.904Z", 
      "isExpired": false,
      "lastModifiedTimestamp": null,
      "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
    })),
    expire: jest.fn().mockImplementation(()=> (
      {
      "id": "/sessions/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09",
      "userId": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      "expiryDate": "2022-06-26T14:24:04.904Z", 
      "isExpired": true,
      "lastModifiedTimestamp": null,
      "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
    })),
    findSessionByCredential: jest.fn().mockImplementation(()=> ({
      token: 'fakeToken',
      expired: false
    }))
  };
  const userAuthnConfig = {
    JWT_SECRET: 'superSecret',
    JWT_TOKEN_EXPIRATION: expiresInOneHour
  };

  test('Should register the UserAuthn API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();
    PluginUserAuthn(mockSandbox);

    expect(mockSandbox.plugin.mock.calls.length === 1).toBe(true);
    expect(typeof(mockSandbox.plugin.mock.calls[0][0]) === 'object').toBe(true);
    expect(typeof(mockSandbox.plugin.mock.calls[0][0]['fn']) === 'function').toBe(true);
    expect(mockSandbox.plugin.mock.calls[0][0]['name'] === '/plugins/user-authn').toBe(true);
  });

  test('Should be able to create a new user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    
    PluginUserAuthn(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](userAuthnConfig, mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential({ user: mockUser, role: 'user' });
    expect(typeof(credential) === 'string').toBe(true);
  });

  test('Should be able to expire an existing user authentication credential', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    PluginUserAuthn(mockSandbox);
    
    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](userAuthnConfig, mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential({ user: mockUser, role: 'user' });
    const credentialExpired = await testPlugin.expireAuthnCredential(credential);
    const { sid: sessionId } = jwt.decode(credential);

    expect(credentialExpired).toBe(true);
    expect(mockSessionRepo.expire.mock.calls[0][0] === sessionId).toBe(true);
  });

  test('Should be able to verify an existing user authentication credential is still valid', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    PluginUserAuthn(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](userAuthnConfig, mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential({ user: mockUser, role: 'user' });
    const isValidCredential = await testPlugin.validateAuthnCredential(credential);
    
    expect(isValidCredential).toBe(true);
  });

  test('Should be able to verify an existing user authentication credential is invalid', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    PluginUserAuthn(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](userAuthnConfig, mockSessionRepo);
    const isValidCredential = await testPlugin.validateAuthnCredential('fakeToken');
    
    expect(isValidCredential).toBe(false);
  });

  test('Should be able to identify an existing user authentication credential that is INVALID', async () => {
    const mockSandbox = MockSandboxFactory();
    const mockUser = { id: faker.datatype.uuid() };
    PluginUserAuthn(mockSandbox);

    // Create an instance of the plugin
    const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](userAuthnConfig, mockSessionRepo);
    const credential = await testPlugin.issueAuthnCredential({ user: mockUser, role: 'user' });
    await testPlugin.expireAuthnCredential(credential);
    const isValidCredential = await testPlugin.validateAuthnCredential(credential);
    
    expect(isValidCredential).toBe(false);
  });
});
// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import UserService from '../../../lib/services/user/index.js';

/**
 * This test suite verifies the User Service interface.
 */
describe('UserService', () => {
  test('Should register the User Service API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();

    UserService(mockSandbox);

    expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
    expect(mockSandbox.put.mock.calls[0][0] === 'userService').toBe(true);
    expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('create')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('createUserPassword')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('deleteUser')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editEmailAddress')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editName')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editMotto')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('emailAddressExists')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getUserByEmail')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getAllUsers')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getUserById')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getUserRole')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('isUserPasswordCorrect')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('setRepository')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('userExists')).toBe(true);
  });
});
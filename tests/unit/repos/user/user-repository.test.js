// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFactory from '../../../mocks/mock-sandbox-factory.js';
import UserRepository from '../../../../lib/repos/user/index.js';

/**
 * This test suite verifies the PostRepository interface.
 */
describe('UserRepository Initialization', () => {
  test('Should register the UserRepository API on the sandbox on module initialization via `put`', async () => {
      const mockSandbox = MockSandboxFactory();
      UserRepository(mockSandbox);

    expect(mockSandbox.put.mock.calls.length).toBe(1);
    expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object');
    expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
    expect(mockSandbox.put.mock.calls[0][0] === 'userRepo').toBe(true);
    expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('create')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editEmailAddress')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editName')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('editMotto')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('emailAddressExists')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('findOneByEmail')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('findAll')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('findOneById')).toBe(true);
  });
});
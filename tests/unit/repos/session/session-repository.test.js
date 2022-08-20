// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property
import MockSandboxFactory from '../../../mocks/mock-sandbox-factory.js';
import SessionRepository from '../../../../lib/repos/session/index.js';

/**
 * This test suite verifies the SessionRepository interface.
 */
describe('SessionRepository Initialization', () => {
  test('Should register the SessionRepository API on the sandbox on module initialization via `put`', async () => {
    const mockSandbox = MockSandboxFactory();
    SessionRepository(mockSandbox);

    expect(mockSandbox.put.mock.calls.length).toBe(1);
    expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object');
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('create')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('expireSession')).toBe(true);
  });
});
import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import SessionService from '../../../lib/services/session/index.js';

/**
 * This test suite verifies the Session Service interface.
 */
describe('SessionService', () => {
  test('Should register the Session Service API on the sandbox', async () => {
    const mockSandbox = MockSandboxFactory();
    SessionService(mockSandbox);

    expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
    expect(mockSandbox.put.mock.calls[0][0] === 'sessionService').toBe(true);
    expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('create')).toBe(true);
    expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('setRepository')).toBe(true);
  });
});
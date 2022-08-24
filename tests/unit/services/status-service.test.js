// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFactory from '../../mocks/mock-sandbox-factory.js';
import StatusService from '../../../lib/services/status/index.js';

/**
 * This test suite verifies the Status Service interface.
 */
describe('StatusService', () => {
    test('Should register the Status Service API on the sandbox', async () => {
        const mockSandbox = MockSandboxFactory();
        StatusService(mockSandbox);

        expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
        expect(mockSandbox.put.mock.calls[0][0] === 'statusService').toBe(true);
        expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getSystemStatus')).toBe(true);
    });
});
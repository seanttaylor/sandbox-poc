// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import Supervisor from '../../../lib/supervisor/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';

/**
 * This test suite verifies the Supervisor API.
 */
describe('Supervisor', () => {
    test('Should be able to expose a method to set the number of errors that must be reported before restarting a module', async () => {
        const mockSandbox = MockSandBoxFactory();
        Supervisor(mockSandbox);

        expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
        expect(typeof(mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
        
        // We validate the `setErrorThreshold` is made available to the sandbox
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('setErrorThreshold')).toBe(true);
    });
});
// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import MockSandboxFacory from '../../mocks/mock-sandbox-factory.js';
import WAL from '../../../lib/wal/index.js';

/**
 * This test suite verifies the WAL interface.
 */
 describe('WAL', () => {
    test('Should register the WAL API on the sandbox', async () => {
        const mockSandbox = MockSandboxFacory();
        WAL(mockSandbox);

        expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
        expect(mockSandbox.put.mock.calls[0][0] === 'wal').toBe(true);
        expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getLastSequenceId')).toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getAllEntries')).toBe(true);
    });
});
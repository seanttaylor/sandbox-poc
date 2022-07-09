import WAL from '../../../lib/wal/index.js';

const on = jest.fn();
const notify = jest.fn();
const fakeController = {
    '/plugins/events-authz': {
        on,
        notify
    }
};

/**
 * Creates a mock sandbox for modules under test to consume
 * @returns {Object}
 */
function BoxFactory() {

    return {
        put: jest.fn(),
        get(name) {
            return fakeController[name];
        }
    }
}

/**
 * This test suite verifies the WAL interface.
 */
 describe('WAL', () => {
    test('Should register the WAL API on the sandbox', async () => {
        const mockSandbox = BoxFactory();
        WAL(mockSandbox);

        expect(mockSandbox.put.mock.calls.length === 1).toBe(true);
        expect(mockSandbox.put.mock.calls[0][0] === 'wal').toBe(true);
        expect(typeof (mockSandbox.put.mock.calls[0][1]) === 'object').toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getLastSequenceId')).toBe(true);
        expect(Object.keys(mockSandbox.put.mock.calls[0][1]).includes('getAllEntries')).toBe(true);
    });
});
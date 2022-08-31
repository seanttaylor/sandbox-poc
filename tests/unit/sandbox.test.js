// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import Sandbox from '../../src/sandbox/index.js';

/**
 * This test suite verifies the {Sandbox} interface.
 */
describe('Sandbox', () => {
    test('Should create a sandboxed application', async () => {
        const fakeApp = jest.fn();

        Sandbox.of([],fakeApp);

        // The application should be launched exactly once.
        expect(fakeApp.mock.calls.length).toEqual(1);

        // The application is launched with access to the sandbox.
        expect(typeof(fakeApp.mock.calls[0][0]) === 'object').toBe(true);
    });
});
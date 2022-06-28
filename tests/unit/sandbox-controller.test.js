import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite verifies the {SandboxController} interface.
 */
describe('SandboxController', () => {
    test('Should return an object conforming to the {SandboxController} interface', async () => {
        const myBox = {};
        const { controller } = SandboxController(myBox);

        expect(Object.keys(controller).includes('ajax')).toBe(true);
        expect(Object.keys(controller).includes('errors')).toBe(true);
        expect(Object.keys(controller).includes('events')).toBe(true);
        expect(Object.keys(controller).includes('put')).toBe(true);
    });
});
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite verifies the {SandboxController} interface.
 */
describe('SandboxController', () => {
    test('Should return an object conforming to the {SandboxController} interface', async () => {
        const myBox = {};
        const { controller } = SandboxController(myBox);

        expect(typeof controller.get('ajax')).toEqual('object');
        expect(typeof controller.get('errors')).toEqual('object');
        expect(typeof controller.get('events')).toEqual('object');
        expect(typeof controller.put).toEqual('function');
        expect(typeof controller.get).toEqual('function');
    });
});
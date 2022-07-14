// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import PluginChaos from '../../../lib/plugins/chaos';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';

/**
 * This test suite verifies Chaos plugin API.
 */
describe('ChaosPlugin', () => {

    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        
        PluginChaos(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should call the `plugin` method with the plugin configuration', async () => {
        const mockSandbox = MockSandBoxFactory();

        PluginChaos(mockSandbox);

        expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);

        // This plugin does not extend a default sandbox API so the `of` property is not required
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(false);
    });

    test('Should call the `fn` method defined on the plugin configuration to launch the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();

        PluginChaos(mockSandbox);

        // Create a fake plugin instance and provide it with dependencies
        const mockPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ chaosEnabled: true });

        // Validate the plugin returns the correct API
        expect(typeof (mockPlugin)).toBe('object');
        expect(Object.keys(mockPlugin).includes('getAllExperiments')).toBe(true);
        expect(Object.keys(mockPlugin).includes('runAllExperiments')).toBe(true);
    });

});
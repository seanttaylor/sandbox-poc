// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import PluginStatusRouter from '../../../lib/plugins/router/status/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';

/**
 * This test suite verifies StatusRouter plugin functionality.
 */
describe('StatusRouterPlugin', () => {

    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginStatusRouter(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should call the `plugin` method with the plugin configuration', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginStatusRouter(mockSandbox);

        expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);

        // This plugin does not extend a default sandbox API so the `of` property is not required
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(false);
    });

    test('Should call the `fn` method defined on the plugin configuration to launch the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockHttpGet = jest.fn();
        const MockRouterFactory = () => { return { get: mockHttpGet } };

        PluginStatusRouter(mockSandbox);

        // Create a fake plugin instance and provide it with dependencies
        const mockPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](MockRouterFactory);

        // Validate the plugin returns the correct API
        expect(typeof (mockPlugin)).toBe('object');
        expect(Object.keys(mockPlugin).includes('get')).toBe(true);
    });


    test('Should be able to get an object describing system status via the router plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockHttpGet = jest.fn();
        const json = jest.fn();
        const set = jest.fn();
        const status = jest.fn();
        const mockStatusService = {
            getSystemStatus: () => { return { uptime: 42, status: 'OK' } }
        };
        const MockRouterFactory = () => { return { get: mockHttpGet } };

        PluginStatusRouter(mockSandbox);

        // Create a fake plugin instance and provide it with dependencies
        mockSandbox.plugin.mock.calls[0][0]['fn'](MockRouterFactory, mockStatusService);

        // Validate the mocked router `get` method is called to register the '/' route with a handler
        expect(mockHttpGet.mock.calls[0][0] === '/').toBe(true);
        expect(typeof (mockHttpGet.mock.calls[0][1]) === 'function').toBe(true);

        // Call the registered route handler with bogus request and response objects
        // The route handler is async so we have to `await` here
        await mockHttpGet.mock.calls[0][1]({}, { json, set, status }, "");

        // Verify response object methods are called
        expect(set.mock.calls.length === 1).toBe(true);
        expect(status.mock.calls.length === 1).toBe(true);
        expect(json.mock.calls.length === 1).toBe(true);

        expect(set.mock.calls[0][0] === 'content-type').toBe(true);
        expect(set.mock.calls[0][1] === 'application/json').toBe(true);

        expect(status.mock.calls[0][0] === 200).toBe(true);

        // Verify the route handler returns the system status object as a json payload
        expect(typeof (json.mock.calls[0][0]) === 'object').toBe(true);
        expect(json.mock.calls[0][0]['uptime'] === 42).toBe(true);
        expect(json.mock.calls[0][0]['status'] === 'OK').toBe(true);
    });

});
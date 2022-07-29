// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import PluginEventAuthz from '../../../lib/plugins/event-authz/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';
import SandboxController from '../../../src/sandbox-controller/index.js';

/**
 * This test suite verifies EventAuthz plugin functionality.
 */
describe('EventAuthzPlugin', () => {
    const testSchema =  {
        "$schema": "https://json-schema.org/draft/2019-09/schema",
        "$id": "http://example.com/example.json",
        "type": "object",
        "default": {},
        "title": "Root Schema",
        "required": [
            "foo",
            "qux"
        ],
        "properties": {
            "foo": {
                "type": "string",
                "default": "",
                "title": "The foo Schema",
                "examples": [
                    "bar"
                ]
            },
            "qux": {
                "type": "integer",
                "default": 0,
                "title": "The qux Schema",
                "examples": [
                    3
                ]
            }
        },
        "examples": [{
            "foo": "bar",
            "qux": 3
        }]
    };
    
    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginEventAuthz(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should call the `plugin` method with the plugin configuration', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginEventAuthz(mockSandbox);

        expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(true);
    });

    test('Should call the `fn` method defined on the plugin configuration to launch the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const notify = jest.fn();
        const on = jest.fn();
        PluginEventAuthz(mockSandbox);

        // We create a fake plugin instance and provide the default application events interface
        const fakePlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ notify, on });

        // We validate the plugin returns the correct API
        expect(typeof (fakePlugin)).toBe('object');
        expect(Object.keys(fakePlugin).includes('on')).toBe(true);
        expect(Object.keys(fakePlugin).includes('notify')).toBe(true);
    });

    test('Should successfully notify authorized subscribers', async () => {
        const mockSandbox = MockSandBoxFactory();
        const notify = jest.fn();
        const on = jest.fn();
        const handler = jest.fn();
        PluginEventAuthz(mockSandbox);

        const fakePlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ notify, on });

        fakePlugin.on({
            event: 'application.info.testEventDoNotRemove',
            subscriberId: 'testRunner',
            handler
        });
        fakePlugin.notify('application.info.testEventDoNotRemove', 42);

        expect(notify.mock.calls.length).toEqual(1);
        expect(on.mock.calls.length).toEqual(1);
    });

    test('Should NOT register UNAUTHORIZED subscribers', async () => {
        const mockSandbox = MockSandBoxFactory();
        const notify = jest.fn();
        const on = jest.fn();
        const handler = jest.fn();
        PluginEventAuthz(mockSandbox);

        const fakePlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ notify, on });

        fakePlugin.on({
            event: 'application.info.testEventDoNotRemove',
            subscriberId: 'randomSubscriber',
            handler
        });
        fakePlugin.notify('application.info.testEventDoNotRemove', 42);

        // Since randomSubscriber does not have permissions, the mocked `events.on` method does not subscribe anything
        expect(notify.mock.calls.length).toEqual(1);
        expect(on.mock.calls.length).toEqual(0);
    });

    test('Should not be able to subscribe to events that have not been preconfigured', async () => {
        const mockSandbox = MockSandBoxFactory();
        const notify = jest.fn();
        const on = jest.fn();
        const handler = jest.fn();
        PluginEventAuthz(mockSandbox);

        const fakePlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ notify, on });

        fakePlugin.on({
            event: 'bogusEvent',
            subscriberId: 'testRunner',
            handler
        });
        fakePlugin.notify('bogusEvent', 42);

        // Since bogusEvent is not configured in permissions, the mocked `events.on` method does not subscribe anything
        expect(notify.mock.calls.length).toEqual(1);
        expect(on.mock.calls.length).toEqual(0);
    });

    test('Should not be able to subscribe to events without explicit permission set', async () => {
        const sandbox = {}
        const { controller } = SandboxController(sandbox);
        const handler = jest.fn();

        PluginEventAuthz(controller);

        const events = controller.get('/plugins/events-authz');
        
        events.on({
            event: 'application.info.testEventDoNotRemove',
            subscriberId: 'testRunner1',
            handler
        });
        events.notify('application.info.testEventDoNotRemove', 42);

        // We verify that the handler is not called indicating the subscription was not permitted to go through
        expect(handler.mock.calls.length).toEqual(0);
    });
});
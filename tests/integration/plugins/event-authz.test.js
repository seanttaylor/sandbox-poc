import PluginEventAuthz from '../../../lib/plugins/event-authz';
import SandboxController from '../../../src/sandbox-controller/index.js';
import path from 'node:path';

describe('PluginEventsAuthz', () => {
    const testSchemaPath = path.join(__dirname, 'event-authz-test-schema.js');

    test('Should be able to trigger an event that has been registered with an event schema', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        
        PluginEventAuthz(controller);
        
        const events = controller.get('/plugins/events-authz');
        const fakeCallback = jest.fn();
        
        await events.on({ 
            event: 'application.info.testEventDoNotRemove', 
            handler: fakeCallback, 
            subscriberId: 'testRunner', 
            schemaPath: testSchemaPath
        });

        events.notify('application.info.testEventDoNotRemove', {
            foo: 'bar',
            qux: 3
        });

        const fakePayload = fakeCallback.mock.calls[0][0]['payload']();

        expect(fakeCallback.mock.calls.length).toBe(1);
        expect(fakePayload.foo).toEqual('bar');
        expect(fakePayload.qux).toEqual(3);
    });

    test('Should NOT be able to trigger an event that has been registered with an event schema with INVALID data', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        
        PluginEventAuthz(controller);
        
        const events = controller.get('/plugins/events-authz');
        const fakeCallback = jest.fn();
        
        await events.on({ 
            event: 'application.info.testEventDoNotRemove', 
            handler: fakeCallback, 
            subscriberId: 'testRunner', 
            schemaPath: testSchemaPath
        });
        
        events.notify('application.info.testEventDoNotRemove', 42);

        expect(fakeCallback.mock.calls.length).toBe(0);
    });

});
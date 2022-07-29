import { faker } from '@faker-js/faker';
import SandboxController from '../../src/sandbox-controller/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';
import Supervisor from '../../lib/supervisor/index.js';

/**
 * This test suite verifies the Supervisor functionality.
 */
describe('Supervisor', () => {
    test('Should be able to set the number of errors to report before attempting to restart a module', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        
        PluginEventAuthz(controller);
        Supervisor(controller);

        sandbox.my.supervisor.setErrorThreshold(42);

        const { AppEvent } = controller.get('/plugins/events-authz');

        sandbox.my.supervisor.onApplicationError(
            AppEvent({
                code: 'service.error',
                message: 'The post could not be created',
                name: 'LibPostRouterError',
                module: '/lib/plugins/router/post',
                _open: {
                    message: faker.hacker.phrase(),
                    serviceName: 'postService',
                }
            })
        );

        const myHistogram = sandbox.my.supervisor.getErrors();

        myHistogram.analyze((_histogram) => {
            expect(_histogram['service.error']['postService'] === 1).toBe(true);
        });

        expect(sandbox.my.supervisor.getErrorThreshold() === 42).toBe(true);
    });

    test('Should be able to update the count of errors when the `application.error` event fires', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        Supervisor(controller);

        const { AppEvent } = controller.get('/plugins/events-authz');

        // We emit the event twice to exercise both the case this is the first time this event type has been emitted as 
        // well as the case where this event type has been emitted before
        sandbox.my.supervisor.onApplicationError(
            AppEvent({
                code: 'service.error',
                message: 'The post could not be created',
                name: 'LibPostRouterError',
                module: '/lib/plugins/router/post',
                _open: {
                    message: faker.hacker.phrase(),
                    serviceName: 'postService',
                }
            })
        );

        sandbox.my.supervisor.onApplicationError(
            AppEvent({
                code: 'service.error',
                message: 'The post could not be created',
                name: 'LibPostRouterError',
                module: '/lib/plugins/router/post',
                _open: {
                    message: faker.hacker.phrase(),
                    serviceName: 'postService',
                }
            })
        );

        const myHistogram = sandbox.my.supervisor.getErrors();
        myHistogram.analyze((_histogram) => {
            expect(_histogram['service.error']['postService'] === 2).toBe(true);
        });
    });

    test('Should be able to update the count of errors when the `application.error` event fires', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        Supervisor(controller);

        const { AppEvent } = controller.get('/plugins/events-authz');
    
        sandbox.my.supervisor.setErrorThreshold(1);

        // We emit the event twice to ensure the `application.error.globalErrorThreshholdExceeded` event fires
        sandbox.my.supervisor.onApplicationError(
            AppEvent({
                code: 'service.error',
                message: 'The post could not be created',
                name: 'LibPostRouterError',
                module: '/lib/plugins/router/post',
                _open: {
                    message: faker.hacker.phrase(),
                    serviceName: 'postService',
                }
            })
        );

        sandbox.my.supervisor.onApplicationError(
            AppEvent({
                code: 'service.error',
                message: 'The post could not be created',
                name: 'LibPostRouterError',
                module: '/lib/plugins/router/post',
                _open: {
                    message: faker.hacker.phrase(),
                    serviceName: 'postService',
                }
            })
        );

        const myHistogram = sandbox.my.supervisor.getErrors();
        myHistogram.analyze((_histogram) => {
            expect(_histogram['service.error']['postService'] === 2).toBe(true);
        });
    });
});
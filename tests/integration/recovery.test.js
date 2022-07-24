import SandboxController from '../../src/sandbox-controller/index.js';
import RecoveryManager from '../../lib/recovery/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';
import Supervisor from '../../lib/supervisor/index.js';

/**
 * This test suite verifies the RecoveryManager functionality.
 */
describe('RecoveryManger', () => {

    test('Should be able to inspect all recovery strategies when the global error threshold is exceeded', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        RecoveryManager(controller);

        const events = controller.get('/plugins/events-authz');
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };

        events.notify('recovery.recoveryStrategyRegistered', { moduleName: 'postService', strategies: [mockStrategy] });
        events.notify('application.error.globalErrorThresholdExceeded', { code: 'service.error', errorCount: 1, moduleName: 'postService' });
      
        const recoveryStrategies = sandbox.my.recovery.getAllStrategies();
        // We subtract 1 from `attemptOffset` because it is 1 based and arrays are 0 based
        const strategyId = recoveryStrategies.postService.attemptOffset - 1;

        expect(typeof (recoveryStrategies) === 'object').toBe(true);
        expect(recoveryStrategies.lastAttemptedStrategy === 'mockStrategy').toBe(true);
        expect(typeof (recoveryStrategies.postService.strategies[strategyId].getStats()) === 'object').toBe(true);
        expect(recoveryStrategies.postService.strategies[strategyId].getStats().attemptCount === 1).toBe(true);
    });

    test('Should be able to trigger on `recoveryAttemptCompleted` event when a recovery strategy executes', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        const fakeRecoveryAttempted = jest.fn();

        PluginEventAuthz(controller);
        RecoveryManager(controller);

        const events = controller.get('/plugins/events-authz');
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };

        events.on({
            event: 'recovery.recoveryAttemptCompleted',
            handler: fakeRecoveryAttempted,
            subscriberId: 'testRunner'
        })

        events.notify('recovery.recoveryStrategyRegistered', {
            moduleName: 'postService',
            strategies: [mockStrategy]
        });
        events.notify('application.error.globalErrorThresholdExceeded', { code: 'service.error', errorCount: 1, moduleName: 'postService' });

        const fakeEventPayload = fakeRecoveryAttempted.mock.calls[0][0]['payload']();

        expect(typeof (fakeEventPayload) === 'object').toBe(true);
        expect(Object.keys(fakeEventPayload).includes('moduleName')).toBe(true);
        expect(Object.keys(fakeEventPayload).includes('fn')).toBe(true);
    });

    test('Should be able to trigger `recovery.moduleRecovered` event on successful recovery', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        const fakeRecoveryAttempted = jest.fn()
        const subscriberId = 'testRunner';

        PluginEventAuthz(controller);
        Supervisor(controller);
        RecoveryManager(controller);

        const events = controller.get('/plugins/events-authz');
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };

        events.on({
            event: 'recovery.recoveryAttemptCompleted',
            handler: fakeRecoveryAttempted,
            subscriberId
        });

        events.on({
            event: 'recovery.moduleRecovered',
            handler: (moduleName) => {
                /**************** (ASSERTION HERE BECAUSE WE HAVE TO WAIT FOR AN EMITTED EVENT) ****************/
                expect(moduleName === 'postService').toBe(true);
                /***********************************************************************************************/
            },
            subscriberId
        });

        events.notify('recovery.recoveryStrategyRegistered', {
            moduleName: 'postService',
            strategies: [mockStrategy]
        });

        events.notify('application.error', {
            code: 'service.error',
            message: 'The post could not be created',
            name: 'LibPostServiceError',
            module: '/lib/services/post',
            _open: {
                serviceName: 'postService'
            }
        });

        // We extract the payload from the 'recovery.recoveryAttemptCompleted' event
        const fakeEventPayload = fakeRecoveryAttempted.mock.calls[0][0]['payload']();

        // We call the callback in from the event payload above with a stubbed module error count provided by `/lib/supervisor`
        fakeEventPayload.fn(1);

        const allStrategies = sandbox.my.recovery.getAllStrategies();
        expect(allStrategies.lastAttemptedStrategyStatus === 'success').toBe(true);
    });

    

    test('Should NOT trigger `recovery.moduleRecovered` event on FAILED recovery attempt', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        const fakeRecoveryAttempted = jest.fn().mockImplementation(()=> {
            throw Error();
        });
        const subscriberId = 'testRunner';

        PluginEventAuthz(controller);
        RecoveryManager(controller);

        const events = controller.get('/plugins/events-authz');
        const mockStrategy = { 
            name: 'mockStrategy', 
            fn: jest.fn().mockImplementation(()=> {
                throw Error();
            })
        }; 

        events.on({
            event: 'recovery.recoveryAttemptCompleted',
            handler: fakeRecoveryAttempted,
            subscriberId
        });

        events.notify('recovery.recoveryStrategyRegistered', {
            moduleName: 'postService',
            strategies: [mockStrategy]
        });

        events.notify('application.error.globalErrorThresholdExceeded', { code: 'service.error', errorCount: 1, moduleName: 'postService' });

        const allStrategies = sandbox.my.recovery.getAllStrategies();

        // We validate that the handler for the `recovery.recoveryAttemptCompleted` event was NOT called indicating an error during recovery.
        expect(fakeRecoveryAttempted.mock.calls.length === 0).toBe(true);
        expect(allStrategies.lastAttemptedStrategyStatus === 'error').toBe(true);
    });
});
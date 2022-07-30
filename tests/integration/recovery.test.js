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
        const { AppEvent } = events;
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };

        sandbox.my.recovery.onRecoveryStrategyRegistered(
            AppEvent({
                serviceName: 'postService',
                strategies: [mockStrategy]
            })
        );

        sandbox.my.recovery.onGlobalErrorThresholdExceeded(
            AppEvent({ 
                code: 'service.error', 
                errorCount: 1, 
                serviceName: 'postService' 
            })
        );

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
        const { AppEvent } = events;
        const mockStrategy = { name: 'mockStrategy', fn: jest.fn() };

        events.on({
            event: 'application.recovery.recoveryAttemptCompleted',
            handler: fakeRecoveryAttempted,
            subscriberId: 'testRunner'
        })

        sandbox.my.recovery.onRecoveryStrategyRegistered(
            AppEvent({
                serviceName: 'postService',
                strategies: [mockStrategy]
            })
        );

        sandbox.my.recovery.onGlobalErrorThresholdExceeded(
            AppEvent({ 
                code: 'service.error', 
                errorCount: 1, 
                serviceName: 'postService' 
            })
        );
        
        const fakeEventPayload = fakeRecoveryAttempted.mock.calls[0][0]['payload']();

        expect(fakeRecoveryAttempted.mock.calls.length).toBeTruthy();
        expect(typeof fakeRecoveryAttempted.mock.calls[0][0] === 'object').toBe(true);
        expect(typeof fakeEventPayload === 'string').toBe(true);
    });

    test('`lastAttemptedStrategyStatus` should be `error` when a recovery attempt does NOT recover a failing module', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        const fakeRecoveryAttempted = jest.fn();
        const subscriberId = 'testRunner';

        PluginEventAuthz(controller);
        RecoveryManager(controller);

        const events = controller.get('/plugins/events-authz');
        const { AppEvent } = events;
        const mockStrategy = {
            name: 'mockStrategy',
            fn: jest.fn()
        };

        events.on({
            event: 'application.recovery.recoveryAttemptCompleted',
            handler: fakeRecoveryAttempted,
            subscriberId
        });

        sandbox.my.recovery.onRecoveryStrategyRegistered(
            AppEvent({
                serviceName: 'postService',
                strategies: [mockStrategy]
            })
        );
      
        sandbox.my.recovery.onGlobalErrorThresholdExceeded(
            AppEvent({ 
                code: 'service.error', 
                errorCount: 1, 
                serviceName: 'postService' 
            })
        );

        sandbox.my.recovery.onGlobalErrorThresholdExceeded(
            AppEvent({ 
                code: 'service.error', 
                errorCount: 2, 
                serviceName: 'postService' 
            })
        );


        const allStrategies = sandbox.my.recovery.getAllStrategies();

        // We validate that a succesful recovery attempt that does not *actually* recover the module still results in an error status
        expect(allStrategies.lastAttemptedStrategyStatus === 'error').toBe(true);
    });
});
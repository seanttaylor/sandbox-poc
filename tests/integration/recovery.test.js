import SandboxController from '../../src/sandbox-controller/index.js';
import RecoveryManager from '../../lib/recovery/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';

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
        events.notify('application.error.globalErrorThresholdExceeded', 'postService');

        const recoveryStrategies = sandbox.my.recovery.getAllStrategies();
        // We subtract 1 from `attemptOffset` because it is 1 based and arrays are 0 based
        const strategyId = recoveryStrategies.postService.attemptOffset - 1;

        expect(typeof (recoveryStrategies) === 'object').toBe(true);
        expect(recoveryStrategies.lastAttemptedStrategy === 'mockStrategy').toBe(true);
        expect(typeof(recoveryStrategies.postService.strategies[strategyId].getStats()) === 'object').toBe(true);
        expect(recoveryStrategies.postService.strategies[strategyId].getStats().attemptCount === 1).toBe(true);
    });
});
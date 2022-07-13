import PluginChaos from '../../../lib/plugins/chaos';
import PluginEventAuthz from '../../../lib/plugins/event-authz';
import SandboxController from '../../../src/sandbox-controller/index.js';

/**
 * This test suite verifies Chaos plugin functionality.
 */
describe('ChaosPlugin', () => {
    test('Should be able to register a new experiment via `registrationRequested` event', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        PluginEventAuthz(controller);
        PluginChaos(controller);

        const events = controller.get('/plugins/events-authz');
        const chaosPlugin = sandbox.my.plugins['/plugins/chaos'].load({ chaosEnabled: true });

        events.notify('chaos.experiment.registrationRequested', { name: 'testExperiment', start: jest.fn(), end: jest.fn() });
        const experiments = chaosPlugin.getAllExperiments();

        expect(Object.keys(experiments).includes('testExperiment')).toBe(true);
        expect(experiments.testExperiment.status === 'registered').toBe(true);
    });

    test('Should NOT be able to register a new experiment when `chaosEnabled` is false', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        PluginEventAuthz(controller);
        PluginChaos(controller);

        const events = controller.get('/plugins/events-authz');
        const chaosPlugin = sandbox.my.plugins['/plugins/chaos'].load({ chaosEnabled: false });

        events.notify('chaos.experiment.registrationRequested', { name: 'testExperiment', start: jest.fn(), end: jest.fn() });
        const experiments = chaosPlugin.getAllExperiments();

        expect(Object.keys(experiments).includes('testExperiment')).toBe(false);
        expect(typeof chaosPlugin.runAllExperiments() === 'object').toBe(true);
        expect(Object.keys(chaosPlugin.runAllExperiments()).length === 0).toBe(true);

    });

    test('Should be able to run registered experiments', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        PluginEventAuthz(controller);
        PluginChaos(controller);

        const fakeExperimentConfig = {
            name: 'testExperiment',
            start: jest.fn(),
            end: jest.fn()
        };
        const events = controller.get('/plugins/events-authz');
        const chaosPlugin = sandbox.my.plugins['/plugins/chaos'].load({ chaosEnabled: true });

        events.notify('chaos.experiment.registrationRequested', fakeExperimentConfig);
        const experiments = chaosPlugin.runAllExperiments();

        expect(Object.keys(experiments).includes('testExperiment')).toBe(true);
        expect(experiments.testExperiment.status === 'scheduled').toBe(true);
    });

    test('Should NOT be able to schedule experiments with default plugin options', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);
        PluginEventAuthz(controller);
        PluginChaos(controller);

        const fakeExperimentConfig = {
            name: 'testExperiment',
            start: jest.fn(),
            end: jest.fn()
        };
        const events = controller.get('/plugins/events-authz');
        const chaosPlugin = sandbox.my.plugins['/plugins/chaos'].load({});

        events.notify('chaos.experiment.registrationRequested', fakeExperimentConfig);
        const experiments = chaosPlugin.runAllExperiments();

        expect(Object.keys(experiments).includes('testExperiment')).toBe(false);
        expect(typeof chaosPlugin.runAllExperiments() === 'object').toBe(true);
        expect(Object.keys(chaosPlugin.runAllExperiments()).length === 0).toBe(true);;
    });
});
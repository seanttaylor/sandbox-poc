import Experiment from "../../../src/interfaces/experiment.js";

/**
 * Exposes an API for creating, running and monitoring chaos experiments; used by the [Chaos plugin]{@link module:Chaos}.
 * @param {Object} console - the console interface
 * @param {Number} scheduleTimeoutMillis - number of milliseconds to wait before scheduling an experiment to run
 * @returns {Object}
 */
function ExperimentManager({ console, scheduleTimeoutMillis }) {
    const experiments = {};

    /**
     * Creates a new chaos experiment
     * @param {Experiment} experimentConfig - an instance of the {Experiment} interface
     */
    function createExperiment(experimentConfig) {
        const myExperiment = Experiment(experimentConfig);
        experiments[myExperiment.name] = { status: 'registered', ...myExperiment };
    }

    /**
     * 
     * @returns {Object} - a map of all registered experiments
     */
    function getAllExperiments() {
        return experiments;
    }

    /**
     * Schedules all registered experiments to run
     * @returns {Object}
     */
    function runAllExperiments() {
        /* istanbul ignore next */
        // Reason: the `setTimeout` call puts the execution block at some point in the future after the method has returned
        // We don't really need to test `setTimeout` besides; juice not worth the squeeze here

        Object.values(experiments).forEach((exp) => {
            setTimeout(() => {
                try {
                    exp.start();
                } catch (e) {
                    console.error(e);
                }
            }, scheduleTimeoutMillis);
            experiments[exp.name]['status'] = 'scheduled';
        });

        return experiments;
    }

    return {
        createExperiment,
        getAllExperiments,
        runAllExperiments,
    }
}

/**
 * A plugin that instruments chaos experiments.
 * 
 * The plugin defined below is exposed on the application core under the `sandbox.my.plugins['/plugins/chaos']` namespace
 * @param {Object} sandbox - default sandboxed APIs
 * @module Chaos
 */
export default function ChaosModule(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const console = sandbox.get('console');
    const subscriberId = 'chaos';
    let myExperimentManager;

    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/chaos',
    });

    /**************** PLUGIN DEFINTION ****************/

    /**
     * @param {Boolean} chaosEnabled - indicates whether chaos functionality should be engaged depending on environment (e.g. development)
     * @param {Number} scheduleTimeoutMillis - timeout to wait out before scheduling an experiment to run
     */
    function myPlugin({ chaosEnabled = 'false', scheduleTimeoutMillis = 0 }) {
        if (chaosEnabled === 'false') {
            console.warn('Environment variable (CHAOS_ENABLED) MUST be set true to run *OR* register chaos experiments. See README.md');
            return {
                getAllExperiments: () => ({}),
                runAllExperiments: () => ({}),
                onExperimentRegistrationRequest: ()=> ({})
            };
        }
        myExperimentManager = ExperimentManager({ console, scheduleTimeoutMillis });

        /**************** EVENT REGISTRATION ****************/
        events.on({ event: 'application.ready', handler: ()=> myExperimentManager.runAllExperiments(), subscriberId });

        return {
            getAllExperiments,
            runAllExperiments,
            onExperimentRegistrationRequest
        }
    }

    /**
     * Registers a new chaos experiment for the module to execute
     * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
     * @memberof module:Chaos
     */
    function onExperimentRegistrationRequest(appEvent) {
        const { ...experimentConfig } = appEvent.payload();
        myExperimentManager.createExperiment(experimentConfig);
    }

    // We export the methods below to provide the the application core the ability to start, stop and inspect experiments
    // Note the value of myExperimentManager is not set until the 'chaos.experiment.registrationRequested' fires
    // We wrap them so that the methods are always defined, particularly during test runs where we're first just trying to 
    // validate the API returned by the plugin.

    /**
     * Wrapper around the `getAllExperiments` method of the ExperimentManager
     * @memberof module:Chaos
     * @returns {Object}
     */
    function getAllExperiments() {
        return myExperimentManager.getAllExperiments();
    }

    /**
     * Wrapper around the `runAllExperiments` method of the ExperimentManager
     * @memberof module:Chaos
     * @returns {Object}
     */
    function runAllExperiments() {
        return myExperimentManager.runAllExperiments();
    }

}
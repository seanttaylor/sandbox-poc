
/**
 * 
 * @param {Object} sandbox - default sandboxed APIs
 * @returns 
 */
 export default function ChaosModule(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const subscriberId = 'chaos';

    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/chaos',
    });

    events.on({event: 'chaos.experiment.registrationRequested', handler: onExperimentRegistrationRequest, subscriberId });

    /**
     * @param {Boolean} enable - indicates whether chaos functionality should be engaged depending on environment (e.g. development)
     */
    function myPlugin(enable) { 
        if (!enable) {
            return;
        }

    }

    /**
     * 
     */
    function onExperimentRegistrationRequest(appEvent) {
        const { ...eventConfig } = appEvent.payload();
    }

}
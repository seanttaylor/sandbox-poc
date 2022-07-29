/* istanbul ignore file */
// Reason: Permissions are tested when their associated events are emitted.

// A global list of application events and which modules may subscribe to the events by module API name.
export default {
    'application.ready': {
        chaos: true,
        postService: true,
    },
    'application.error': {
        myApp: true,
        supervisor: true
    },
    'application.error.globalErrorThresholdExceeded': {
        myApp: true,
        recovery: true,
        supervisor: true,
    },
    'application.info.moduleStopped': {
        myApp: true,
        postRepo: true,
    },
    'application.info.moduleRestarted': {
        postRepo: false
    },
    'application.info.testEventDoNotRemove': {
        testRunner: true
    },
    'application.writeAheadLogAvailable': {
        postService: true,
        testRunner: true,
    },
    'chaos.experiment.registrationRequested': {
        chaos: true
    },
    'postService.post.writeRequestReceived': {
        wal: true
    },
    'recovery.moduleRecovered': {
        myApp: true,
        testRunner: true
    },
    'recovery.recoveryStrategyRegistered': {
        recovery: true
    },
    'application.recovery.recoveryAttemptCompleted': {
        myApp: true,
        testRunner: true
    }
}
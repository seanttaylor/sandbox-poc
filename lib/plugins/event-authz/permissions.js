/* istanbul ignore file */
// Reason: Permissions are tested when their associated events are emitted.

// A global list of application events and which modules may subscribe to the events by module API name.
export default {
    'application.ready': {
        postService: true,
        chaos: true
    },
    'application.error': {
        myApp: true,
        supervisor: true
    },
    'application.error.globalErrorThresholdExceeded': {
        myApp: true,
        supervisor: true
    },
    'application.info.moduleStopped': {
        postRepo: true,
        myApp: true
    },
    'application.info.moduleRestarted': {
        postRepo: false
    },
    'application.info.testEventDoNotRemove': {
        testRunner: true
    },
    'chaos.experiment.registrationRequested': {
        chaos: true
    },
    'postService.post.writeRequestReceived': {
        wal: true
    }
}
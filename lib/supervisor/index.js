import Histogram from './histogram.js';
//import ErrorThresholdExceedEvent from '../../src/interfaces/error-threshold-exceeded.js';

/**
 * 
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function Supervisor(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const subscriberId = 'supervisor';
    const histogram = Histogram();
    let globalErrorThreshold = 10;

    sandbox.put('supervisor', { getErrorThreshold, setErrorThreshold, getErrors });
    histogram.onData(onHistogramAddEntry);

    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });
    events.on({ event: 'recovery.recoveryAttemptCompleted', handler: onRecoveryAttemptCompleted, subscriberId });

    /**
     * Sets the maximum number of errors that can be reported before attempting to restart a module
     * @param {Number} threshold - the number of errors that can be reported
     */
    function setErrorThreshold(threshold) {
        globalErrorThreshold = threshold;
    }

    /**
     * Get the histogram to provide access to error statistics
     * @returns {Histogram}
     */
    function getErrors() {
        return histogram
    }

    /**
     * Gets the current error threshold
     * @returns {Number}
     */
    function getErrorThreshold() {
        return globalErrorThreshold
    }

    /**
     * Handler triggered by the `recovery.recoveryAttemptCompleted` event
     * @param {AppEvent} appEvent
     */
    function onRecoveryAttemptCompleted(appEvent) {
        const { code, moduleName, fn: validateRecoveryAttempt } = appEvent.payload();
        const currentModuleErrorCount = histogram.analyze(getCurrentModuleErrorCount({ code, moduleName }));
        validateRecoveryAttempt(currentModuleErrorCount);
    }

    /**
     * Gets the most recent error count for a specified module after a recovery attempt
     * @param {String} code - the error code indicating a specific category of ApplicationError
     * @param {String} moduleName - the module that produced the error
     * @returns {Function} a function that executes processing logic on the histogram
     */
    function getCurrentModuleErrorCount({ code, moduleName }) {
        return function (histogram) {
            return histogram[code][moduleName];
        }
    }

    /**
     * Handler triggered by the `application.error` event
     * @param {AppEvent} appEvent - an instance of the AppEvent interface
     */
    function onApplicationError(appEvent) {
        const eventData = appEvent.payload();
        histogram.add(eventData);
    }

    /**
     * Logic executed each time an entry is added to the histogram
     * @param {Object} currentEntry - the current data entry
     * @param {Object} histogram - the current state of the histogram
     */
    function onHistogramAddEntry(currentEntry, histogram) {
        const errorCount = histogram[currentEntry.code][currentEntry._open.serviceName];
        if (errorCount >= globalErrorThreshold) {
            events.notify('application.error.globalErrorThresholdExceeded', {
                errorCount,
                code: currentEntry.code,
                moduleName: currentEntry._open.serviceName,
            });
        }
    }
}
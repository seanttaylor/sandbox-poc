import Histogram from './histogram';

/**
 * 
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function Supervisor(sandbox) {
    sandbox.put('supervisor', { getErrorThreshold, setErrorThreshold, getErrors });

    const events = sandbox.get('/plugins/events-authz');
    const subscriberId = 'supervisor';
    const histogram = Histogram();
    let globalErrorThreshold = 10;

    histogram.onData(onHistogramAddEntry);
    events.on({ event: 'application.error', handler: onApplicationError, subscriberId });

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
        if (histogram[currentEntry.code][currentEntry._open.serviceName] >= globalErrorThreshold) {
            events.notify('application.error.globalErrorThresholdExceeded', currentEntry._open.serviceName);
        }
    }
}
import Histogram from './histogram.js';

const DEFAULT_GLOBAL_ERROR_COUNT_THRESHOLD = 1;

/**
 * 
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function Supervisor(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    const console = sandbox.get('console');
    const histogram = Histogram();
    let globalErrorThreshold = DEFAULT_GLOBAL_ERROR_COUNT_THRESHOLD;

    /**************** PUBLIC API ****************/
    sandbox.put('supervisor', { 
        getErrorThreshold, 
        getErrors,
        onApplicationError,
        setErrorThreshold,  
    });
    histogram.onData(onHistogramAddEntry);

    /**************** EVENT REGISTRATION ****************/

    /**
     * Sets the maximum number of errors that can be reported before attempting to restart a module
     * @param {Number} threshold - the number of errors that can be reported
     */
    function setErrorThreshold(threshold) {
        globalErrorThreshold = parseInt(threshold);
        console.assert(!Number.isNaN(globalErrorThreshold), 'Application.ConfigurationError => INVALID globalErrorThreshold set. globalErrorThreshold *must* be a number. See README.md');
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
        const errorCount = histogram[currentEntry.code][currentEntry._open.serviceName];
        if (errorCount >= globalErrorThreshold) {
            events.notify('application.error.globalErrorThresholdExceeded', {
                errorCount,
                code: currentEntry.code,
                serviceName: currentEntry._open.serviceName,
            });
        }
    }
}
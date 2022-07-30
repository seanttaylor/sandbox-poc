/* istanbul ignore file */

/**
 * An interface for data associated with an `application.error.globalErrorThresholdExceeded` event
 * @param {String} serviceName - the name of the module that triggeed the error
 * @param {Number} errorCount - the number of errors reported by the module triggering the error
 */
 export default function IErrorThresholdExceededEvent(myImpl = {}) {
    function required() {
        throw Error('Missing implementation');
    }

    return {
        serviceName: myImpl.serviceName || required,
        errorCount: myImpl.errorCount || required,
    };
}
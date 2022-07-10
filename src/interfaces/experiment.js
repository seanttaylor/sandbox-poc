/* istanbul ignore file */

/**
 * A configuration object for creating new chaos experiments
 */
export default function IExperiment(myImpl = {}) {
    function required() {
        throw Error('Missing implementation');
    }

    return {
        end: myImpl.end || required,
        name: myImpl.name || required,
        start: myImpl.start || required,
    };
}
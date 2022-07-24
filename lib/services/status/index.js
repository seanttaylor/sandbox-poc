const startTime = new Date().getTime();

/**
 * Verifies status of system
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function StatusService(sandbox) {
    sandbox.put('statusService', { getSystemStatus });

    /**
     * Returns the status of the system
     * @returns {Object} an object whose fields describe the system status
    */

    /* istanbul ignore next */
    // Reason: these values are either there or they aren't; juice not worth the squeeze testing this branching logic
    function getSystemStatus() {
        const currentTime = new Date().getTime();
        return {
            commitHash: process.env.COMMIT_HASH || null,
            status: 'OK',
            uptime: currentTime - startTime,
            version: process.env.APP_VERSION || null,
        }
    }

}
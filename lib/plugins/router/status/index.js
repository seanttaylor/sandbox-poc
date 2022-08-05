/* istanbul ignore file */

/**
 * Registers HTTP route handlers for public methods of the StatusService.
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/StatusRouter
 */
export default function StatusRouter(sandbox) {
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/status-router',
    });

    /**************** PLUGIN DEFINTION ****************/

    /**
     * Loads the plugin
     * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} statusService - an instance of the StatusService interface 
     * @memberof module:Plugin/StatusRouter
     * @returns {Object}
     */
    function myPlugin(router, statusService) {
        
        // OpenAPI operationId: getSystemStatus
        router.get('/', async (req, res, next) => {
            try {
                const result = await statusService.getSystemStatus();

                res.set('content-type', 'application/json');
                res.status(200);
                res.json(result);

            } catch (e) {
                next(e);
            }
        });

        return router;
    }
}

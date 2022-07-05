/* istanbul ignore file */

/**
 * Exposes the StatusService via an HTTP route
 * @param {Object} sandbox - default sandboxed APIs
 * @returns 
 */
export default function StatusRouter(sandbox) {
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/status-router',
    });

    /**
     * @param {Object} RouterFactory - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} statusService - an instance of the StatusService interface 
     */
    function myPlugin(RouterFactory, statusService) {
        const router = RouterFactory();
        
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

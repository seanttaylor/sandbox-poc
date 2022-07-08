/* istanbul ignore file */

/**
 * Exposes the PostRouter via an HTTP route
 * @param {Object} sandbox - default sandboxed APIs
 * @returns 
 */
export default function PouterRouter(sandbox) {
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/post-router',
    });

    /**
     * @param {Object} RouterFactory - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} postService - an instance of the PostService interface 
     */
    function myPlugin(RouterFactory, postService) {
        const router = RouterFactory();

        // OpenAPI operationId: getAllPosts
        router.get('/posts', async (req, res, next) => {
            try {
                const result = await postService.getAllPosts();

                res.set('content-type', 'application/json');
                res.status(200);
                res.json(result);

            } catch (e) {
                next(e);
            }
        });

        // OpenAPI operationId: getPostById
        router.get('/posts/:id', async (req, res, next) => {
            const id  = req.url;
            try {
                const result = await postService.getPostById(id);

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
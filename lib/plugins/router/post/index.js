/* istanbul ignore file */

/**
 * Exposes the PostRouter via an HTTP route
 * @param {Object} sandbox - default sandboxed APIs
 * @returns 
 */
export default function PostRouter(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/post-router',
    });

    /**
     * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} postService - an instance of the PostService interface 
     */
    function myPlugin(router, postService) {
        //ps = postService.getInstance();
        // OpenAPI operationId: createPost
        router.post('/posts', async (req, res, next) => {
            const authorId = req.body.authorId;
            const body = req.body.body;

            try {
                const result = await postService.create({
                    authorId,
                    body
                });

                res.set('content-type', 'application/json');
                res.status(200);
                res.json(result);

            } catch (e) {
                events.notify('application.error', {
                    code: 'service.error',
                    message: 'The post could not be created',
                    name: 'LibPostRouterError',
                    module: '/lib/plugins/router/post',
                    _open: { 
                        message: e.message, 
                        serviceName: 'postService',
                    }
                });
                next(e);
            }
        });

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
            const id = req.url;
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
/* istanbul ignore file */
// Reason: HTTP endpoints are exercised in API end-to-end tests

/**
 * Runs basic validations on incoming requests (e.g. checks for record existence and user permissions)
 * @param {Object} postService - an instance of the StrategyPostService interface
 * @returns - an Express middleware function
 */
function validateIncomingRequest(postService) {
    return async function(req, res, next) {
        postService.setMediaType(req.headers['accept']);
        const result = await postService.exists(req.url);

        if (!result.exists) {
            res.set('content-type', postService.getMediaType());
            res.status(404);
            res.send(result);
            return;
        }
        next();
    }
}

/**
 * Registers HTTP route handlers for public methods of the PostService.
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/PostRouter
 */
export default function PostRouter(sandbox) {
    const events = sandbox.get('/plugins/events-authz');
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/post-router',
    });

    /**************** PLUGIN DEFINTION ****************/

    /**
     * Loads the plugin
     * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} postService - an instance of the StrategyPostService interface 
     * @memberof module:Plugin/PostRouter
     * @returns {Object}
     */
    function myPlugin(router, postService) {
        //ps = postService.getInstance();  
        
        router.use('/', validateIncomingRequest(postService))
        // OpenAPI operationId: createPost
        router.post('/posts', async (req, res, next) => {
            const authorId = req.body.authorId;
            const body = req.body.body;

            try {
                postService.setMediaType(req.headers['accept']);

                const result = await postService.create({
                    authorId,
                    body
                });

                res.set('content-type', postService.getMediaType());
                res.status(200);
                res.send(result);

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
                postService.setMediaType(req.headers['accept']);

                const result = await postService.getAllPosts();

                res.set('content-type', postService.getMediaType());
                res.status(200);
                res.send(result);

            } catch (e) {
                next(e);
            }
        });

        // OpenAPI operationId: getPostById
        router.get('/posts/:id', async (req, res, next) => {
            const id = req.url;

            try {
                postService.setMediaType(req.headers['accept']);

                const result = await postService.getPostById(id);

                res.set('content-type', postService.getMediaType());
                res.status(200);
                res.send(result);

            } catch (e) {
                next(e);
            }
        });

        // OpenAPI operationId: deletePostById
        router.delete('/posts/:id', async (req, res, next) => {
            const id = req.url;

            try {
                postService.setMediaType(req.headers['accept']);

                const result = await postService.deletePost(id);

                res.set('content-type', postService.getMediaType());
                res.status(200);
                res.send(result);

            } catch (e) {
                next(e);
            }
        });

        // OpenAPI operationId: editPostById
        router.patch('/posts/:id', async (req, res, next) => {
            const id = req.url;
            const body = req.body.body;

            try {
                postService.setMediaType(req.headers['accept']);

                const result = await postService.editPost({ id, body });

                res.set('content-type', postService.getMediaType());
                res.status(200);
                res.send(result);

            } catch (e) {
                next(e);
            }
        });

        return router;
    }
}
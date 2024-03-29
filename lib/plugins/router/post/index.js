/* istanbul ignore file */
// Reason: HTTP endpoints are exercised in API end-to-end tests

/**
 * Registers HTTP route handlers for public methods of the PostService
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

  /* *************** PLUGIN DEFINTION *************** */

  /**
     * Loads the plugin
     * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
     * @param {Object} postService - an instance of the StrategyPostService interface
     * @param {Object} userAuthn - an instance of the PluginUserAuthn interface
     * @param {Object} middleware - an instance of the PluginMiddlewarePost interface
     * @memberof module:Plugin/PostRouter
     * @returns {Object}
     */
  function myPlugin(router, { postService, userAuthn, middleware }) {
    // ps = postService.getInstance();
    // OpenAPI operationId: createPost
    router.post('/posts', async (req, res, next) => {
      const { authorId } = req.body;
      const { body } = req.body;

      if (!authorId || !body) {
        postService.setMediaType('text/html');
        res.set('content-type', 'text/html');
        res.status(400);
        res.send(postService.getErrorResponse(400));
        return;
      }

      try {
        postService.setMediaType(req.headers.accept);

        const result = await postService.create({
          authorId,
          body,
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
          },
        });
        next(e);
      }
    });

    // OpenAPI operationId: getAllPosts
    router.get('/posts', middleware.authenticateIncomingRequest(userAuthn, events), async (req, res, next) => {
      try {
        postService.setMediaType(req.headers.accept);

        const result = await postService.getAllPosts();

        res.set('content-type', postService.getMediaType());
        res.status(200);
        res.send(result);
      } catch (e) {
        next(e);
      }
    });

    // OpenAPI operationId: getPostPreview
    router.get('/posts/preview', async (req, res, next) => {
      const {
        authorDisplayName, authorHandle, body, createdAt,
      } = req.query;
      const mediaType = req.headers.accept;
      const isSupportedMediaType = (mediaType === 'text/html') || (mediaType === '*/*');

      postService.setMediaType('text/html');

      // we cannot generate a preview without the body query parameter
      // we only return previews as html
      if (!body || !isSupportedMediaType) {
        const result = await postService.getErrorResponse(400);
        res.set('content-type', 'text/html');
        res.status(400);
        res.send(result);
        return;
      }

      try {
        const result = await postService.getPostPreview({
          authorDisplayName, authorHandle, body, createdAt,
        });

        res.set('content-type', 'text/html');
        res.status(200);
        res.send(result);
      } catch (e) {
        next(e);
      }
    });

    // OpenAPI operationId: getPostById
    router.get('/posts/:id', middleware.validateIncomingRequest(postService), async (req, res, next) => {
      const id = req.url;

      try {
        postService.setMediaType(req.headers.accept);
        postService.setViewAuthnLevel(res.locals.authn);

        const result = await postService.getPostById(id);

        res.set('content-type', postService.getMediaType());
        res.status(200);
        res.send(result);
      } catch (e) {
        next(e);
      }
    });

    // OpenAPI operationId: deletePostById
    router.delete('/posts/:id', middleware.validateIncomingRequest(postService), async (req, res, next) => {
      const id = req.url;

      try {
        postService.setMediaType(req.headers.accept);

        const result = await postService.deletePost(id);

        res.set('content-type', postService.getMediaType());
        res.status(200);
        res.send(result);
      } catch (e) {
        next(e);
      }
    });

    // OpenAPI operationId: editPostById
    router.patch('/posts/:id', middleware.validateIncomingRequest(postService), async (req, res, next) => {
      const id = req.url;
      const { body } = req.body;

      try {
        postService.setMediaType(req.headers.accept);

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

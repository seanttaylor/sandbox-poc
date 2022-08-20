/* istanbul ignore file */
// Reason: HTTP endpoints are exercised in API end-to-end tests


/**
* Registers HTTP route handlers for public methods of the SessionService
* @param {Object} sandbox - default sandboxed APIs
* @module Plugin/SessionRouter
*/
export default function SessionRouter(sandbox) {
  const events = sandbox.get('/plugins/events-authz');
  sandbox.plugin({
      extendsDefault: false,
      fn: myPlugin,
      name: '/plugins/session-router',
  });

  /**************** PLUGIN DEFINTION ****************/

  /**
   * Loads the plugin
   * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
   * @param {Object} sessionService - an instance of the SessionService interface 
   * @memberof module:Plugin/SessionRouter
   * @returns {Object}
   */
  function myPlugin(router, sessionService) {
      //ps = postService.getInstance();  
      
    // OpenAPI operationId: createSession
    router.put('/sessions', async (req, res, next) => {

      try {
          const { isValid, user } = await userService.validateUser({ emailAddress, password });

          if (!isValid) {
            userService.setMediaType('text/html');
            res.set('content-type', 'text/html');
            res.status(401);
            res.send(userService.getErrorResponse(401));
            return;
          }

          sessionService.setMediaType(req.headers['accept']);

          const result = await sessionService.put({ id: user.id });

          res.set('content-type', sessionService.getMediaType());
          res.status(200);
          res.send(result);
          

      } catch (e) {
        events.notify('application.error', {
            code: 'service.error',
            message: 'The session could not be created',
            name: 'LibSessionRouterError',
            module: '/lib/plugins/router/session',
            _open: {
                message: e.message,
                serviceName: 'sessionService',
            }
        });
        next(e);
      }
    });


    return router;
  }
}
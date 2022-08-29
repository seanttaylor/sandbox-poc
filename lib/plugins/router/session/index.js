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
   * @param {Object} userAuthn - an instance of the PluginUserAuthn interface 
   * @param {Object} userService an instance of the StrategyUserService interface
   * @memberof module:Plugin/SessionRouter
   * @returns {Object}
   */
  function myPlugin(router, { userAuthn, userService }) {
    //ps = postService.getInstance();  
      
    // OpenAPI operationId: createSession
    router.put('/sessions', async (req, res, next) => {
      const { emailAddress, password } = req.body;

      try {
        const { isValid, user } = await userService.validateUserPassword({ emailAddress, password });

        if (!isValid) {
          userService.setMediaType('text/html');
          res.set('content-type', 'text/html');
          res.status(401);
          res.send(userService.getErrorResponse(401));
          return;
        }

        userService.setMediaType(req.headers['accept']);

        const credential = await userAuthn.issueAuthCredential({ user, role: 'user'});
        events.notify('application.authenticationCredentialIssued', credential);
        const result = await userService.login(user);
        
        res.set('set-cookie', credential);
        res.set('content-type', userService.getMediaType());
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
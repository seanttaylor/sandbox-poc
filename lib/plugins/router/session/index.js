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

  /* *************** PLUGIN DEFINTION *************** */

  /**
   * Loads the plugin
   * @param {Object} router - an instance of the ExpressJS `express.Router()` interface
   * @param {Object} userAuthn - an instance of the PluginUserAuthn interface
   * @param {Object} userService an instance of the StrategyUserService interface
   * @memberof module:Plugin/SessionRouter
   * @returns {Object}
   */
  function myPlugin(router /* { userAuthn, userService } */, vendor) {
    const { passport } = vendor;
    router.post('/sessions', passport.authenticate('local', {
      successRedirect: '/api/v1/posts',
      failureRedirect: '/',
    }));
    // ps = postService.getInstance();
    // OpenAPI operationId: createSession
    /* router.put('/sessions', async (req, res, next) => {
      userService.setMediaType(req.headers.accept);
      const { emailAddress, password } = req.body;

      try {
        const record = await userService.validateUserPassword({ emailAddress, password });
        const [validationRequest] = record.data;

        if (!validationRequest.isValid) {
          const response = await userService.getErrorResponse(401);
          res.set('content-type', 'text/html');
          res.status(200);
          res.send(response);
          return;
        }

        const userRecord = await userService.getUserByEmail(emailAddress);
        const [user] = userRecord.data;
        const credential = await userAuthn.issueAuthnCredential({ user, role: 'user' });

        events.notify('application.authenticationCredentialIssued', credential);

        const result = await userService.login(user);

        res.cookie('auth-cred', credential, {
          // Note: for debugging on localhost **DO NOT** set the cookie to expire
          // See https://stackoverflow.com/questions/7346919/chrome-localhost-cookie-not-being-set
          // maxAge: 5000,
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
        });
        res.set('content-type', userService.getMediaType());
        res.set('hx-redirect', '/api/v1/posts');
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
          },
        });
        next(e);
      }
    }); */

    router.get('/login', async (req, res) => {
      res.status(200);
      res.render('login.ejs');
    });

    return router;
  }
}

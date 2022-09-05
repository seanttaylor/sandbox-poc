/**
* Exposes middleware functions for `PluginPostRouter` module
* @param {Object} sandbox - default sandboxed APIs
* @module Plugin/MiddlewarePost
*/
export default function PostMiddleware(sandbox) {
  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/middleware-post',
  });

  /* *************** PLUGIN DEFINTION *************** */

  /**
   * Loads the plugin
   * @memberof module:Plugin/MiddlewarePost
   * @returns {Object}
   */
  function myPlugin() {
    /**
    * Runs basic validations on incoming requests (e.g. checks for record existence and user permissions)
    * @param {Object} postService - an instance of the StrategyPostService interface
    * @returns - an Express middleware function
    */
    function validateIncomingRequest(postService) {
      return async function (req, res, next) {
        postService.setMediaType(req.headers.accept);
        const result = await postService.exists(req.url);

        if (!result.exists) {
          res.set('content-type', postService.getMediaType());
          res.status(404);
          res.send(result.response);
          return;
        }
        next();
      };
    }

    /**
    * Inspects authorization/authentication credentials
    * @param {Object} userAuthn - an instance of the PluginUserAuthn interface
    * @param {Object} events - an instance of the PluginEventsAuthz interface
    * @returns - an Express middleware function
    */
    function authenticateIncomingRequest(userAuthn, events) {
      return async function (req, res, next) {
        const authnErrorMessage = 'Could not authenticate incoming request';
        const authzHeaderCred = req.headers.authorization;
        const cookieCred = req.cookies['auth-cred'];

        if (authzHeaderCred && userAuthn.validateAuthnCredential(authzHeaderCred)) {
          next();
          return;
        }

        if (cookieCred && userAuthn.validateAuthnCredential(cookieCred)) {
          next();
          return;
        }

        events.notify('application.error', {
          code: 'service.error',
          message: authnErrorMessage,
          name: 'LibPostRouterError',
          module: '/lib/plugins/router/post',
          _open: {
            message: authnErrorMessage,
            serviceName: 'postService',
          },
        });

        next({ message: authnErrorMessage });
      };
    }

    return {
      authenticateIncomingRequest,
      validateIncomingRequest,
    };
  }
}

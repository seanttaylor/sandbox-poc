import ejs from 'ejs';

/**
 * Wrapper for the `ejs.renderFile` method
 * @param {String} templatePath
 * @param {Any} data
 * @param {Object} options
 */
async function renderEJSTemplate(templatePath, data, options) {
  const promise = new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, { data }, options, (error, html)=> {
        /* istanbul ignore next */
        // Reason: We don't need to test the implementation of EJS's error handling; juice not worth the squeeze here
        if (error) {
            reject(error);
            return;
        }
        resolve(html);
    });
  }).catch(console.error);;

  return promise;
}

/**
 * [UserService] {@link module:UserService} API, enabling hypermedia responses in the HAL format
 * Plugin methods defined below are exposed on the application core under the `sandbox.my.plugins['/plugins/html/post']` namespace.
 * @param {Object} sanbox - default sandbox APIs 
 * @module Plugin/HTMLPost
 */
export default function PluginHTMLUser(sandbox) {
    sandbox.plugin({
      extendsDefault: false,
      fn: myPlugin,
      name: '/plugins/html/user',
    });

  /**************** PLUGIN DEFINTION ****************/

  /**
   * Loads the plugin 
   * @param {Object} pluginConfig.templatRootPath - file path to the directory containing EJS templates
   * @param {Object} UserService - an instance of the StrategyUserService interface 
   * @memberof module:Plugin/HTMLPost
   * @returns {Object}
   */
  function myPlugin(pluginConfig, userService) {
    const { templateRootPath } = pluginConfig;
    const templateMap = {
      create: `${templateRootPath}/user/create.ejs`,
      exists: `${templateRootPath}/post/exists.ejs`,
      deleteUser: `${templateRootPath}/post/delete-post.ejs`,
      getAllUsers: `${templateRootPath}/post/index.ejs`,
      getUserById: `${templateRootPath}/post/get-post-by-id.ejs`,
      loginSuccess: `${templateRootPath}/user/login-success.ejs`,
    };

    const errorTemplateMap = {
      400: `${templateRootPath}/client-error.ejs`,
    }

    /**
     * Wraps the `UserService.create` method's result in HTML formatted response
     * @returns {String}
     */
    async function create(data) {
      const plainResponse  = await userService.create(data);
      const HTMLResponse = await renderEJSTemplate(templateMap.create, { post: plainResponse });
      return HTMLResponse;
    }

    /**
     * Wraps the `UserService.deleteUser` method's result in HTML formatted response
     * @returns {String}
     */
    async function deleteUser(id) {
      await userService.deleteUser(id);
      const HTMLResponse = await renderEJSTemplate(templateMap.deleteUser);
      return HTMLResponse;
    }

    /**
     * Wraps the `UserService.exists` method's result in HTML formatted response
     * @param {String} id - unique id for a `User`
     * @param {String} body - updated body text for a `User`
     * @returns {Object}
     */
    async function exists(id) {
      const result  = await userService.exists(id);
      const HTMLResponse = await renderEJSTemplate(templateMap.exists, { result });
      return {
        exists : result.exists,
        response: HTMLResponse
      }
    }

    /**
     * Wraps the `UserService.getAllUsers` method's result in HTML formatted response
     * @returns {String}
     */
    async function getAllUsers() {
      const { data: plainResponse } = await userService.getAllUsers();
      // The reason `plainResponse` isn't attached to a `post` property on an object here is because the template expects a plain Array
      const HTMLResponse = await renderEJSTemplate(templateMap.getAllUsers, plainResponse);
      return HTMLResponse;
    }

    /**
     * Returns an HTML page upon successful user login
     * @param {Object} user - a `User` instance
     * @returns {String}
     */
    async function login(user) {
      return renderEJSTemplate(templateMap.loginSuccess, { user });
    }

    /**
     * Wraps the `UserService.validateUserPassword` method's result in HTML formatted response 
     * @returns {String}
     */
    async function validateUserPassword(args) {
      return userService.validateUserPassword(args); 
    }

    /**
     * Generates a generic error response formatted as HTML
     * @param {String} statusCode 
     * @returns {String}
     */
      async function getErrorResponse(statusCode) {
      const HTMLResponse = await renderEJSTemplate(errorTemplateMap[statusCode], {});
      return HTMLResponse;
    }

    return {
      create,
      deleteUser,
      exists,
      getAllUsers,
      getUserByEmail: userService.getUserByEmail,
      getErrorResponse,
      login,
      validateUserPassword
    };
  }
}
import ejs from 'ejs';

/**
 * Wrapper for the `ejs.renderFile` method
 * @param {String} templatePath
 * @param {Any} data
 * @param {Object} options
 */
async function renderEJSTemplate(templatePath, data, options) {
  const promise = new Promise((resolve, reject) => {
    ejs.renderFile(templatePath, { data }, options, (error, html) => {
      /* istanbul ignore next */
      // Reason: We don't need to test the implementation of EJS's error handling; juice not worth the squeeze here
      if (error) {
        reject(error);
        return;
      }
      resolve(html);
    });
  }).catch(console.error);

  return promise;
}

/**
 * [PostService] {@link module:PostService} API, enabling hypermedia responses in the HAL format
 * Plugin methods defined below are exposed on the application core under the `sandbox.my.plugins['/plugins/html/post']` namespace.
 * @param {Object} sanbox - default sandbox APIs
 * @module Plugin/HTMLPost
 */
export default function PluginHTMLPost(sandbox) {
  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/html/post',
  });

  /** ************** PLUGIN DEFINTION *************** */

  /**
   * Loads the plugin
   * @param {Object} pluginConfig.templatRootPath - file path to the directory containing EJS templates
   * @param {Object} postService - an instance of the StrategyPostService interface
   * @memberof module:Plugin/HTMLPost
   * @returns {Object}
   */
  function myPlugin(pluginConfig, postService) {
    const { templateRootPath } = pluginConfig;
    const templateMap = {
      create: `${templateRootPath}/post/create.ejs`,
      editPost: `${templateRootPath}/post/edit-post.ejs`,
      exists: `${templateRootPath}/post/exists.ejs`,
      deletePost: `${templateRootPath}/post/delete-post.ejs`,
      getAllPosts: `${templateRootPath}/post/index.ejs`,
      getPostById: `${templateRootPath}/post/get-post-by-id.ejs`,
      getPostPreview: `${templateRootPath}/post/get-post-preview.ejs`,
    };
    const errorTemplateMap = {
      400: `${templateRootPath}/client-error.ejs`,
    };
    let _currentViewAuthnLevel = 'not-authenticated';

    /**
     * Wraps the `PostService.create` method's result in HTML formatted response
     * @param {Object} data - required data for a new `Post`
     * @returns {Object}
     */
    async function create(data) {
      const plainResponse = await postService.create(data);
      const HTMLResponse = await renderEJSTemplate(templateMap.create, { post: plainResponse });
      return HTMLResponse;
    }

    /**
     * Wraps the `PostService.deletePost` method's result in HTML formatted response
     * @param {String} id - unique id for a `Post`
     * @returns {Object}
     */
    async function deletePost(id) {
      await postService.deletePost(id);
      const HTMLResponse = await renderEJSTemplate(templateMap.deletePost);
      return HTMLResponse;
    }

    /**
     * Wraps the `PostService.editPost` method's result in HTML formatted response
     * @param {String} id - unique id for a `Post`
     * @param {String} body - updated body text for a `Post`
     * @returns {Object}
     */
    async function editPost({ id, body }) {
      const plainResponse = await postService.editPost({ id, body });
      const HTMLResponse = await renderEJSTemplate(templateMap.editPost, { post: plainResponse });
      return HTMLResponse;
    }

    /**
     * Wraps the `PostService.exists` method's result in HTML formatted response
     * @param {String} id - unique id for a `Post`
     * @param {String} body - updated body text for a `Post`
     * @returns {Object}
     */
    async function exists(id) {
      const result = await postService.exists(id);
      const HTMLResponse = await renderEJSTemplate(templateMap.exists, { result });
      return {
        exists: result.exists,
        response: HTMLResponse,
      };
    }

    /**
     * Wraps the `PostService.getAllPosts` method's result in HTML formatted response
     * @returns {Object}
     */
    async function getAllPosts() {
      const { data: posts } = await postService.getAllPosts();
      // The reason `plainResponse` isn't attached to a `post` property on an object here is because the template expects a plain Array
      const HTMLResponse = await renderEJSTemplate(templateMap.getAllPosts, { authn: _currentViewAuthnLevel, posts });
      return HTMLResponse;
    }

    /**
     * Wraps the `PostService.getPostById` method's result in HTML formatted response
     * @param {String} id - unique id for a `Post`
     * @returns {Object}
     */
    async function getPostById(id) {
      const result = await postService.getPostById(id);
      const [plainResponse] = result.data;
      const HTMLResponse = await renderEJSTemplate(templateMap.getPostById, { post: plainResponse });
      return HTMLResponse;
    }

    /**
     * Generates an HTML preview of a `Post` before publishing
     * @param {Object} previewData
     * @returns {String}
     */
    async function getPostPreview(previewData) {
      const HTMLResponse = await renderEJSTemplate(templateMap.getPostPreview, { post: previewData });
      return HTMLResponse;
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

    /**
     * Specifies whether the rendered view should display HTML elements and controls reserved for authenticated users
     * @param {Object} authn - an object containing specified authentication information
     */
    function setViewAuthnLevel(authn) {
      _currentViewAuthnLevel = authn.isAuthenticated ? 'authenticated' : 'not-authenticated';
    }

    return {
      create,
      deletePost,
      editPost,
      exists,
      getAllPosts,
      getPostById,
      getPostPreview,
      getErrorResponse,
      setViewAuthnLevel,
    };
  }
}

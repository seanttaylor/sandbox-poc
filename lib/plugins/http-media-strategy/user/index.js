/*istanbul ignore  */
// Reason: This plugin is a composite of *other* plugins (e.g. htmlUserService, hypermediaUserService) that are tested independently elsewhere

import IUserService from '../../../../src/interfaces/user-service.js';

/**
 * A map of instances of the UserService interface that return specified HTTP media types
 * @typedef MediaStrategyConfiguration
 * @property {Object} textHTML - an instance of the UserService interface returning HTML
 * @property {Object} applicationHALJSON - an instance of the UserService interface returning the HAL hypermedia format
 * @property {Object} applicationJSON - an instance of the UserService interface returning JSON
 */

/**
 * Extends the existing UserService API to allow service responses to be formatted to specified HTTP media types (e.g. text/html).
 * Plugin methods defined below are exposed on the application core under the `sandbox.my.plugins['/plugins/http-media-strategy-user']` namespace.
 * @param {Object} sandbox - default sandbox APIs 
 * @module Plugin/HTTPMediaStrategyUser
 */
export default function PluginHTTPMediaStrategyUser(sandbox) {

  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/http-media-strategy/user',
  });


  /**************** PLUGIN DEFINTION ****************/

  /**
   * Loads the plugin 
   * @param {MediaStrategyConfiguration} strategyConfiguration - http media types that the plugin may select to return to clients at runtime
   * @memberof module:Plugin/HTTPMediaStrategyUser
   * @returns {Object}
   */
  function myPlugin(strategyConfiguration) {
    let _currentMediaStrategy;
    let _currentMediaType;
    const defaultMediaType = IUserService(strategyConfiguration.textHTML); 

    /* Map of valid HTTP request `Accept` header values */
    const strategyMap = {
      '*/*': defaultMediaType,
      'application/hal+json': IUserService(strategyConfiguration.applicationHAL),
      'application/json': IUserService(strategyConfiguration.applicationJSON),
      'text/html': IUserService(strategyConfiguration.textHTML),
    };

    /**
     * Specifies the media type (e.g. `application/json`) the client wants the service response formatted as
     * @param {String} mediaType - the client's desired response format
     */
    function setMediaType(mediaType) {
      if (!Object.keys(strategyMap).includes(mediaType)) {
        // If we get any media types outside of the ones we support we return the default media type
        _currentMediaStrategy = IUserService(strategyMap['text/html']);
        _currentMediaType = 'text/html';
        return;
      }
      _currentMediaStrategy = IUserService(strategyMap[mediaType]);
      _currentMediaType = mediaType;
    }

    /**
     * Gets the currently configured mediaType
     * @returns {String}
     */
    function getMediaType() {
      return _currentMediaType;
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function create(args) {
      return _currentMediaStrategy.create(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function createUserPassword(args) {
      return _currentMediaStrategy.createUserPassword(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function deleteUser(args) {
      return _currentMediaStrategy.deleteUser(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function editEmailAddress(args) {
      return _currentMediaStrategy.editEmailAddress(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function editName(args) {
      return _currentMediaStrategy.editName(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function editMotto(args) {
      return _currentMediaStrategy.editMotto(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function emailAddressExists(args) {
      return _currentMediaStrategy.emailAddressExists(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function getErrorResponse(args) {
      return _currentMediaStrategy.getErrorResponse(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function getUserByEmail(args) {
      return _currentMediaStrategy.getUserByEmail(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function getUserById(args) {
      return _currentMediaStrategy.getUserById(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function getAllUsers(args) {
      return _currentMediaStrategy.getAllUsers(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function validateUserPassword(args) {
      return _currentMediaStrategy.validateUserPassword(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function resetUserPassword(args) {
      return _currentMediaStrategy.resetUserPassword(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function setRepository(args) {
      return _currentMediaStrategy.setRepository(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
     async function login(args) {
      return _currentMediaStrategy.login(args);
    }

    /**
     * Wrapper for strategy method
     * @param args - client-supplied arguments
     * @returns - the strategy return type
     */
    async function userExists(args) {
      return _currentMediaStrategy.userExists(args);
    }

    return {
      create,
      createUserPassword,
      deleteUser,
      editEmailAddress,
      editName,
      editMotto,
      emailAddressExists,
      getAllUsers,
      getErrorResponse,
      getUserByEmail,
      getUserById,
      getMediaType,
      login,
      resetUserPassword,
      setRepository,
      userExists,
      setMediaType,
      validateUserPassword,
    };
  }

}
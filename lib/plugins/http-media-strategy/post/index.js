/*istanbul ignore  */
// Reason: This plugin is a composite of *other* plugins (e.g. htmlPostService, hypermediaPostService) that are tested independently elsewhere
import IPostService from '../../../../src/interfaces/post-service.js';

/**
 * A map of instances of the PostService interface that return specified HTTP media types
 * @typedef MediaStrategyConfiguration
 * @property {Object} textHTML - an instance of the PostService interface returning HTML
 * @property {Object} applicationHALJSON - an instance of the PostService interface returning the HAL hypermedia format
 * @property {Object} applicationJSON - an instance of the PostService interface returning JSON
 */

/**
 * Extends the existing PostService API to allow service responses to be formatted to specified HTTP media types (e.g. text/html).
 * Plugin methods defined below are exposed on the application core under the `sandbox.my.plugins['/plugins/http-media-strategy-post']` namespace.
 * @param {Object} sanbox - default sandbox APIs 
 * @module Plugin/HTTPMediaStrategyPost
 */
export default function PluginHTTPMediaStrategyPost(sandbox) {

    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/http-media-strategy/post',
    });


    /**************** PLUGIN DEFINTION ****************/

    /**
     * Loads the plugin 
     * @param {MediaStrategyConfiguration} strategyConfiguration - http media types that the plugin may select to return to clients at runtime
     * @memberof module:Plugin/HTTPMediaStrategyPost
     * @returns {Object}
     */
    function myPlugin(strategyConfiguration) {
        let _currentMediaStrategy;
        let _currentMediaType;
        const defaultMediaType = IPostService(strategyConfiguration.applicationHAL);

        /* Map of valid HTTP request `Accept` header values */
        const strategyMap = {
            //'*/*': defaultMediaType,
            'application/hal+json': defaultMediaType,
            'application/json': IPostService(strategyConfiguration.applicationJSON),
            'text/html': IPostService(strategyConfiguration.textHTML),
        };

        /**
         * Specifies the media type (e.g. `application/json`) the client wants the service response formatted as
         * @param {String} mediaType - the client's desired response format
         */
        function setMediaType(mediaType) {
            if (!Object.keys(strategyMap).includes(mediaType)) {
                // If we get any media types outside of the ones we support we return the default media type
                _currentMediaStrategy = IPostService(strategyMap['application/hal+json']);
                _currentMediaType = 'application/hal+json';
                return;
            }
            _currentMediaStrategy = IPostService(strategyMap[mediaType]);
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
        async function deletePost(args) {
            return _currentMediaStrategy.deletePost(args);
        }

        /**
         * Wrapper for strategy method
         * @param args - client-supplied arguments
         * @returns - the strategy return type
         */
        async function editPost(args) {
            return _currentMediaStrategy.editPost(args);
        }

        /**
         * Wrapper for strategy method
         * @param args - client-supplied arguments
         * @returns - the strategy return type
         */
        async function exists(args) {
            return _currentMediaStrategy.exists(args);
        }

        /**
         * Wrapper for strategy method
         * @param args - client-supplied arguments
         * @returns - the strategy return type
         */
        async function getAllPosts(args) {
            return _currentMediaStrategy.getAllPosts(args);
        }

        /**
         * Wrapper for strategy method
         * @param args - client-supplied arguments
         * @returns - the strategy return type
         */
        async function getPostById(args) {
            return _currentMediaStrategy.getPostById(args);
        }

        return {
            create,
            deletePost,
            editPost,
            exists,
            getAllPosts,
            getMediaType,
            getPostById,
            setMediaType,
        };
    }

}
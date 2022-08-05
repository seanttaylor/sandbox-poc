import halson from 'halson';

/**
 * Extends [PostService] {@link module:PostService} API, enabling hypermedia responses in the HAL format
 * See (https://stateless.group/hal_specification.html) to learn more about the HAL hypermedia format
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/HypermediaPost
 */
export default function HypermediaPost(sandbox) {
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/hypermedia-post',
    });

    /**************** PLUGIN DEFINTION ****************/

    /**
     * Loads the plugin
     * @param {Object} postService - an instance of the PostService interface 
     * @memberof module:Plugin/HypermediaPost
     * @returns {Object}
     */
    function myPlugin(postService) {
        /**
         * Wraps the `PostService.create` method's result in HAL formatted response
         * @param {Object} data - required data for a new `Post`
         * @returns {Object}
         */
        async function create(data) {
            const plainResponse = await postService.create(data);
            const HALResponse = halson(plainResponse);

            HALResponse.addLink('self', `${plainResponse.id}`)
            .addLink('author', `${plainResponse.authorId}`);

            return HALResponse;
        }


        return { create };
    }
}
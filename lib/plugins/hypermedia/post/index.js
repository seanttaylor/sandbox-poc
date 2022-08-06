import halson from 'halson';

/**
 * Extends [PostService] {@link module:PostService} API, enabling hypermedia responses in the HAL format
 * See (https://stateless.group/hal_specification.html) to learn more about the HAL hypermedia format
 * See (https://en.wikipedia.org/wiki/Hypermedia) to learn about Hypermedia more broadly
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/HypermediaPost
 */
export default function HypermediaPost(sandbox) {
    sandbox.plugin({
        extendsDefault: false,
        fn: myPlugin,
        name: '/plugins/hypermedia-post',
    });

    /**
     * Creates an `Author` hypermedia relation
     * @param {String} authorId - unique id for a `Post` author
     * @returns {Object} 
     */
    function AuthorRelation(authorId) {
        return { href: authorId, rel: 'author' }
    }

    /**
     * Creates an `AuthorPost` hypermedia relation
     * @param {String} authorId - unique id for a `Post` author
     * @returns {Object} 
     */
    function AuthorPostRelation(authorId) {
        return { href: `${authorId}/posts`, rel: 'post' };
    }

    /**
     * Creates a generic `Post` hypermedia relation; a relation that specifically address creating and reading resources
     * @returns {Object} 
     */
    function PostRelation() {
        return { href: '/api/posts', rel: 'post', title: 'Create new or fetch existing published Posts' };
    }

    /**
     * Creates a `PostWrite` hypermedia relation; a relation that specifically addresses updating and deleting resources
     * @returns {Object} 
     */
    function PostWriteRelation(id) {
        return { href: `/api/posts/${id}`, rel: 'post', title: 'Update or delete existing Posts' };
    }

    /**
     * Creates an `APIRoot` hypermedia relation
     * @returns {Object} 
     */
    function APIRootRelation() {
        return { href: `/api`, rel: 'home' };
    }

    /**
     * Takes collection of `Posts` to format as a list HALResources
     * @param {Array} collection - a list of `Posts`
     * @returns {Array} 
     */
    function PostCollection(collection) {
        return collection.map((post) => {
            return halson(post)
                .addLink({ self: post.id, rel: 'post' })
                .addLink('author', AuthorRelation(post.authorId))
                .addLink('author-posts', AuthorPostRelation(post.authorId))
        });
    }


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
            const { authorId, id } = plainResponse;

            HALResponse
                .addLink('self', `${id}`)
                .addLink('author', AuthorRelation(authorId))
                .addLink('author-posts', AuthorPostRelation(authorId))
                .addLink('delete-post', PostWriteRelation(id))
                .addLink('index', APIRootRelation());

            return HALResponse;
        }

        /**
         * Wraps the `PostService.deletePost` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @param {String} authorId - unique id for an `Author`
         * @returns {Object}
         */
        async function deletePost(id, authorId) {
            const plainResponse = await postService.deletePost(id);
            const HALResponse = halson(plainResponse);

            HALResponse
                .addLink('self', { href: null, rel: 'post' })
                .addLink('author', AuthorRelation(authorId))
                .addLink('author-posts', AuthorPostRelation(authorId))
                .addLink('post', PostRelation())
                .addLink('index', APIRootRelation());

            return HALResponse;
        }

        /**
         * Wraps the `PostService.editPost` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @param {String} body - updated body text for a `Post`
         * @returns {Object}
         */
        async function editPost({ id, body }) {
            const plainResponse = await postService.editPost({ id, body });
            const HALResponse = halson(plainResponse);
            const { authorId, id: postId } = plainResponse;

            HALResponse
                .addLink('self', { href: id, rel: 'post' })
                .addLink('author', AuthorRelation(authorId))
                .addLink('author-posts', AuthorPostRelation(authorId))
                .addLink('delete-post', PostWriteRelation(postId))
                .addLink('post', PostRelation())
                .addLink('index', APIRootRelation());

            return HALResponse;
        }

        /**
         * Wraps the `PostService.getAllPosts` method's result in HAL formatted response
         * @returns {Object}
         */
        async function getAllPosts() {
            const plainResponse = await postService.getAllPosts();
            const HALResponse = halson({ entries: plainResponse.length });

            HALResponse
                .addLink('self', { href: '/posts', rel: 'post' })
                .addLink('post', PostRelation())
                .addLink('index', APIRootRelation())
                .addEmbed('posts', PostCollection(plainResponse));

            return HALResponse;
        }

        /**
         * Wraps the `PostService.getPostById` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @returns {Object}
         */
        async function getPostById(id) {
            const [plainResponse] = await postService.getPostById(id);
            const HALResponse = halson(plainResponse);
            const { authorId, id: postId } = plainResponse;

            HALResponse
                .addLink('self', { href: id, rel: 'post' })
                .addLink('author', AuthorRelation(authorId))
                .addLink('author-posts', AuthorPostRelation(authorId))
                .addLink('delete-post', PostWriteRelation(postId))
                .addLink('post', PostRelation())
                .addLink('index', APIRootRelation())

            return HALResponse;
        }

        return {
            create,
            deletePost,
            editPost,
            getAllPosts,
            getPostById,
            _default: postService
        };
    }
}
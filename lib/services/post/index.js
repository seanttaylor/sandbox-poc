import IPostRepository from '../../../src/interfaces/post-repository.js';

/**
 * Exposes API for managing posts
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function PostService(sandbox) {
    const { ApplicationError } = sandbox.get('errors');
    const console = sandbox.get('console');
    let myRepository = IPostRepository();

    sandbox.put('postService', { 
        create, 
        deletePost, 
        editPost, 
        exists, 
        getAllPosts,
        getPostById, 
        setRepository 
    });

    /**
     * Helper function for generating errors
     * @param {String} code - an error code to refer to in any error documentation
     * @param {String} message - a message to log
     * @returns {ApplicationError}
    */
    function onError(code, message) {
        return ApplicationError({
            code,
            message,
            name: "LibPostServiceError",
            module: "/lib/services/post",
        });
    }

    /**
     * Sets the repository for the service to use
     * @param {Object} repo - an object having the {IPostRepository} interface 
    */
    function setRepository(repo) {
        if (!repo) {
            console.error(onError(
                'client.error',
                'PostServiceError.BadRequest.CannotSetRepository => (repo) is undefined'
            ));
            return;
        }

        myRepository = IPostRepository(repo);
    }

    /**
     * Creates a new `Post` on the data store
     * @param {String} authorId
     * @param {String} body
     * @returns {Object} - the newly created `Post`
    */
    async function create({ authorId, body }) {
        return myRepository.create({ authorId, body });
    }

    /**
     * Deletes an existing `Post` on the data store
     * @param {String} id
     * @returns {Array} - an empty list
    */
     async function deletePost(id) {
        return myRepository.deletePost(id);
    }

    /**
     * Updates an existing `Post` on the data store
     * @param {String} id
     * @param {String} body
     * @returns {Array} - a list containing the updated `Post`
    */
    async function editPost({ id, body }) {
        return myRepository.editPost({ id, body });
    }

    /**
     * Indicates whether a `Post` exists
     * @param {String} id
     * @returns {Boolean} 
    */
    async function exists(id) {
        return myRepository.exists(id);
    }

    /**
     * Returns list of `Posts` from the data store
     * @returns {Array} - a list of `Posts`
    */
    async function getAllPosts() {
        return myRepository.getAllPosts();
    }

    /**
     * Fetches a single `Post` from the data store
     * @param {String} id
     * @returns {Object} - a list of `Posts`
    */
      async function getPostById(id) {
        return myRepository.getPostById(id);
    }
}
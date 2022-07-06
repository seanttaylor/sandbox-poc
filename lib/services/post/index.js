import IPostRepository from '../../../src/interfaces/post-repository.js';

/**
 * Exposes API for managing posts
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function PostService(sandbox) {
    const { ApplicationError } = sandbox.get('errors');
    const console = sandbox.get('console');
    let myRepository = IPostRepository();

    sandbox.put('postService', { getAllPosts, setRepository });

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
     * Returns list of `Posts` from the data store
     * @returns {Array} an object whose fields describe the system status
    */
    async function getAllPosts() {
        return myRepository.getAllPosts();
    }

}
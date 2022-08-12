/* istanbul ignore file */

/**
 * An object having the IPostService API; a set of methods for managing Posts 
 * @typedef {Object} IPostService
 * @property {Function} create - creates a new Post 
 * @property {Function} deletePost - deletes a Post by its uuid
 * @property {Function} editPost - edits the Post title or body 
 * @property {Function} exists - verifies a Post exists 
 * @property {Function} getPostById - finds a Post by uuid
 * @property {Function} getAllPosts - finds all Posts 
 * @property {Function} getPostsByAuthorId - finds a list of all unique
 * Posts by a specified author
 */

/**
 * Interface for a service that manages `Posts`
 * @param {IPostService} myImpl - object defining concrete implementations for interface methods
 */

 function IPostService(myImpl = {}) {
    function required() {
        throw Error('Missing implementation');
    }

    return {
        create: myImpl.create || required,
        deletePost: myImpl.deletePost || required,
        editPost: myImpl.editPost || required,
        exists: myImpl.exists || required,
        getPostById: myImpl.getPostById || required,
        getAllPosts: myImpl.getAllPosts || required,
        getPostsByAuthorId: myImpl.getPostsByAuthorId || required,
        setRepository: myImpl.setRepository || required
    };
}

export default IPostService;
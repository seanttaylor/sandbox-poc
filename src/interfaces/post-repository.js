/* istanbul ignore file */

/**
 * An object having the IPostRepository API; a set of methods for
 * managing posts in the datastore
 * @typedef {Object} IPostRepository
 * @property {Function} create - creates a new Post in the data store
 * @property {Function} getPostById - finds a Post in the data store by uuid
 * @property {Function} getAllPosts - finds all Posts in the data store
 * @property {Function} getPostsByAuthorId - finds a list of all unique
 * posts by a specified author
 * @property {Function} deletePost - deletes a Post in the
 * data store by its uuid
 * @property {Function} editPost - edits the Post title or body 
 * @property {Function} exists - verifies a Post exists in the data store
 */

/**
 * Interface for a repository of posts
 * @param {IPostRepository} myImpl - object defining concrete implementations for interface methods
 */

function IPostRepository(myImpl = {}) {
    function required() {
        throw Error('Missing implementation');
    }

    return {
        create: myImpl.create || required,
        getPostById: myImpl.getPostById || required,
        getAllPosts: myImpl.getAllPosts || required,
        getPostsByAuthorId: myImpl.getPostsByAuthorId || required,
        deletePost: myImpl.deletePost || required,
        editPost: myImpl.editPost || required,
        exists: myImpl.exists || required,
    };
}

export default IPostRepository;
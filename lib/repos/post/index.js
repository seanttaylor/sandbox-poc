import IPostRepository from '../../../src/interfaces/post-repository.js';

const SCHEMA_VERSION = '0.0.1';

/**
 * Creates a valid `Post` ready to be committed to the datastore
 * @param {String} id - unique id for `Post`
 * @param {String} authorId - unique id or the author of a `Post`
 * @param {String} authorHandle - handle of the author of a `Post`
 * @param {String} authorDisplayName - display name of the author of a `Post`
 * @param {String} sequenceId - unique id for this `Post` in the Write-Ahead Log
 * @param {String} body - body content of the `Post`
 * @param {Array} comments - list of unique id of `Comments` on the `Post`
 * @param {String} createdAt - date `Post` was created
 * @param {String} lastModified - date `Post` was last updated
 * @param {Array} likes - list of unique ids of `Likes` on the `Post`
 * @param {String} schemaURL - the URL to the JSON Schema document for this `Post` version
 * @param {String} schemaVersion - the version number of the schema this `Post` conforms to
 * @memberof module:Repository/Post
 * @returns {Object}3
 */
function PostDocument({
  id,
  authorId,
  authorDisplayName,
  authorHandle,
  sequenceId,
  body,
  comments = [],
  createdAt = new Date().toISOString(),
  lastModified = null,
  likes = [],
  schemaURL = `${process.env.SCHEMA_BASE_URL}/post/${SCHEMA_VERSION}/post.json`,
  schemaVersion = SCHEMA_VERSION,
}) {
  return {
    id,
    authorId,
    authorDisplayName,
    authorHandle,
    sequenceId,
    body,
    comments,
    createdAt,
    lastModified,
    likes,
    schemaURL,
    schemaVersion,
  };
}

/**
 * Exposes API for managing `Post` instances.
 * @param {Object} sandbox - sandboxed module APIs
 * @module Repository/Post
 */
export default function (sandbox) {
  const database = sandbox.get('database');

  /** ************** PUBLIC API *************** */
  sandbox.put('postRepo', IPostRepository({
    create,
    editPost,
    exists,
    deletePost,
    getAllPosts,
    getPostById,
    getPostsByAuthorId,
  }));

  /**
   * Creates a new `Post`
   * @param {String} id - id of the new `Post`
   * @param {String} authorId - author of the new `Post`
   * @param {String} body - body of the new `Post`
   * @returns {Object}
   */
  async function create(data) {
    /*
      some validation logic will go here publishing an event if there is a failure
      box.events.notify('application.error', {
        code: 'client.error',
        message: 'The post could not be created',
        name: 'LibPostRepoModuleError',
        module: '/lib/repos/post',
        _open: {...arguments}
      });
    */

    const document = PostDocument(data);
    const [post] = await database.putOne({ doc: document, collection: 'posts' });
    return post;
  }

  /**
   * Gets a `Post` by its unique id
   * @param {String} id - uuid for a post
   * @returns {Array}
   */
  async function getPostById(id) {
    const data = await database.findOne({ id, collection: 'posts' });
    return data.map((p) => PostDocument(p));
  }

  /**
   * Gets all published `Posts`
   * @returns {Array}
   */
  async function getAllPosts() {
    const data = await database.findAll('posts');
    return data.map((p) => PostDocument(p));
  }

  /**
   * Get all `Posts` associated with a specified author
   * @param {String} id - uuid for a platform author
   * @returns {Array}
   */
  async function getPostsByAuthorId(id) {
    const data = await database.findAll('posts');
    return data.filter((p) => p.authorId === id).map((p) => PostDocument(p));
  }

  /**
  * Edits an existing `Post`
  * @param {String} id - uuid for a post
  * @param {String} body - text to update existing post
  * @returns {PostDocument}
  */
  async function editPost({ id, body }) {
    const [existingRecord] = await database.findOne({
      id,
      collection: 'posts',
    });
    const [data] = await database.updateOne({
      doc: Object.assign(existingRecord, { body }),
      collection: 'posts',
    });
    return PostDocument(data);
  }

  /**
   * Deletes an existing `Post`
   * @param {String} id - uuid of a post
   * @returns {Array}
   */
  async function deletePost(id) {
    return database.removeOne({ id, collection: 'posts' });
  }

  /**
   * Indicates whether a specified id is associated with an existing `Post`
   * @param {String} id - uuid of a post
   * @returns {Boolean}
   */
  async function exists(id) {
    return database.exists({ id, collection: 'posts' });
  }
}

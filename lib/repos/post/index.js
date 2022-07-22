import IPostRepository from '../../../src/interfaces/post-repository.js';

/**
 * Creates a structured valid `Post` ready to be committed to the datastore
 * @param {String} id 
 * @param {String} authorId 
 * @param {String} sequenceId 
 * @param {String} body
 * @param {Array} comments
 * @param {String} createdAt
 * @param {String} lastModified
 * @param {Array} likes 
 * @param {String} schemaURL
 * @param {String} schemaVersion
 * @returns {Object}
 */
function PostDocument({
  id,
  authorId,
  sequenceId,
  body,
  comments = [],
  createdAt = new Date().toISOString(),
  lastModified = null,
  likes = [],
  schemaURL,
  schemaVersion
}) {

  return {
    id,
    authorId,
    sequenceId,
    body,
    comments,
    createdAt,
    lastModified,
    likes,
    schemaURL,
    schemaVersion
  }
}

/**
 * Exposes API for managing `Post` instances
 * @param {Object} box - sandboxed module APIs
 */
export default function (box) {
  const database = box.get('database');
  const events = box.get('/plugins/events-authz');
  const subscriberId = 'postRepo';

  box.put('postRepo', IPostRepository({
    create,
    editPost,
    exists,
    deletePost,
    getAllPosts,
    getPostById,
    getPostsByAuthorId
  }));

  events.on({ event: 'application.info.moduleStopped', handler: onModuleStopped, subscriberId });
  events.on({ event: 'application.info.moduleRestarted', handler: onModuleRestarted, subscriberId });

  /**
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
   * @param {String} id - uuid for a post
   */
  async function getPostById(id) {
    const data = await database.findOne({ id, collection: 'posts' });
    return data.map((p) => PostDocument(p));
  }

  /**
   * @returns {Array}
   */
  async function getAllPosts() {
    const data = await database.findAll('posts');
    return data.map((p) => PostDocument(p));
  }

  /**
   * @param {String} id - uuid for a platform author
   */
  async function getPostsByAuthorId(id) {
    const data = await database.findAll('posts');
    return data.filter((p) => p.authorId === id).map((p) => PostDocument(p));
  }

  /**
  * @param {String} id - uuid for a post
  * @param {String} body - text to update existing post
  */
  async function editPost({ id, body }) {
    const [existingRecord] = await database.findOne({
      id,
      collection: 'posts'
    });
    const [data] = await database.updateOne({
      doc: Object.assign(existingRecord, { body }),
      collection: 'posts'
    });
    return PostDocument(data);
  }

  /**
   * @param {String} id - uuid of a post
   * @returns {Array}
   */
  async function deletePost(id) {
    return database.removeOne({ id, collection: 'posts' });
  }

  /**
   * @param {String} id - uuid of a post
   * @returns {Boolean}
   */
  async function exists(id) {
    return database.exists({ id, collection: 'posts' });
  }

  /**
   * Handles the `application.info.moduleRestarted` event 
   * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
   */
  function onModuleRestarted(appEvent) {

  }

  /** 
   * Handles the `application.info.moduleStopped` event
   * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
   */
  function onModuleStopped(appEvent) {

  }
}
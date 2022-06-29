import { randomUUID } from 'crypto';
import { IPostRepository } from '../../../src/interfaces/post-repository.js';

const outbox = [];
const modulesOfInterest = [];

/**
 * Creates a structured valid Post ready to be committed to the datastore.
 * @param {String} id 
 * @param {String} authorId 
 * @param {String} body
 * @param {Array} comments
 * @param {String} createdAt
 * @param {String} lastModified
 * @param {Array} likes 
 * @returns {Object}
 */
function PostDocument({
  authorId,
  body,
  id = `/posts/${randomUUID()}`,
  comments = [],
  createdAt = new Date().toISOString(),
  lastModified = null,
  likes = []
}) {

  return {
    id,
    authorId,
    body,
    comments,
    createdAt,
    lastModified,
    likes
  }
}

/**
 * @param {Object} box - sandboxed module APIs
 */
export default function (box) {
  const events = box.get('events');
  const database = box.get('database');
  const eventsWithAuthz = box.get('/plugins/events-authz');

  box.put('postRepo', IPostRepository({
    create,
    editPost,
    exists,
    deletePost,
    getAllPosts,
    getPostById,
    getPostsByAuthorId
  }));

  events.on({ event: 'application.info.moduleStopped', handler: onModuleStopped, subscriberId: 'postRepo'});
  events.on({ event: 'application.info.moduleRestarted', handler: onModuleRestarted });

  /**
   * @param {String} author - author of the new Post
   * @param {String} body - test of the new Post
   * @returns {Object}
   */
  async function create(data) {
    /*
      some validation logic will go here publishing an event if there is a failure
      box.events.notify('application.error', {
        code: 'CreateError.BadRequest.CouldNotCreatePost',
        message: 'The post could not be created',
        name: 'LibPostRepoModuleError', 
        module: '/lib/jainky-module',
        _open: {...arguments}
      }); 
    */

    const document = PostDocument(data);
    const [post] = await database.add({ doc: document, collection: 'posts' });
    return post;
  }

  /**
   * @param {String} id - uuid for a post
   */
  async function getPostById(id) {
    const [data] = await database.findOne({ id, collection: 'posts' });
    return data ? PostDocument(data) : [];
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
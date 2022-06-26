import { nil } from 'ajv';
import { randomUUID } from 'crypto';
import { IPostRepository } from '../../../src/interfaces/post-repository.js';

const outbox = [];
const modulesOfInterest = [];

/**
 * Creates a structured valid Post ready to be committed to the datastore.
 * @param {String} authorId 
 * @param {String} body
 * @param {Array} comments
 * @param {String} createdAtTimestamp
 * @param {String} lastModifiedTimestamp
 * @param {Array} likes 
 * @returns {Object}
 */
function PostDocument({
  authorId,
  body,
  comments = [],
  createdAtTimestamp = new Date().toISOString(),
  lastModifiedTimestamp = null,
  likes = []
}) {

  return {
    authorId,
    body,
    comments,
    createdAtTimestamp,
    lastModifiedTimestamp,
    likes
  }
}

/**
 * @param {Object} box - sandboxed module APIs
 */
export default function (box) {
  box.put('postRepo', IPostRepository({ create }));

  box.events.on('application.info.moduleStopped', onModuleStopped);
  box.events.on('application.info.moduleRestarted', onModuleRestarted);

  /**
   * @param {String} author - author of the new Post
   * @param {String} body - test of the new Post
   */
  async function create(data) {
    /*
      some validation logic will go here publishing an event if there is a failure
      box.events.notify('application.error', {
        id: 'CreateError.BadRequest.CouldNotCreatePost',
        message: 'The post could not be created',
        name: 'LibPostRepoModuleError', 
        module: '/lib/jainky-module',
        _open: {...arguments}
      }); 
    */

    const document = PostDocument(data);
    const [post] = await box.database.add({ doc: document, collection: 'posts' });

    box.events.notify('postRepository.postCreated', post);
  }

  /**
   * @param {String} id - uuid for a post
   */
  function getPostById() {
    console.log();
  }

  /**
   * 
   */
  function getAllPosts() {
    console.log();
  }

  /**
   * @param {String} id - uuid for a platform author
   */
  function getPostsByAuthorId() {
    console.log();
  }

  /**
  * @param {String} id - uuid for a post
  * @param {String} body - text to update existing post
  */
  function editPost() {
    console.log();
  }

  /**
   * @param {String} id - uuid of a post
   */
  function deletePost(id) {
    console.log();
  }

  /**
   * @param {String} id - uuid of a post
   */
  function exists(id) {
    console.log();
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
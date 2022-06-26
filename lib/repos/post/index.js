import { randomUUID } from 'crypto';
import { IPostRepository } from '../../../src/interfaces/post-repository';

/**
 * @param {Object} box - sandboxed module APIs
 */
export default function (box) {
  const outbox = [];

  box.put('postRepo', IPostRepository({ create }));

  box.events.on('application.info.moduleStopped', onModuleStopped);
  box.events.on('application.info.moduleRestarted', onModuleRestarted);

  /**
   * @param {String} author - author of the new Post
   * @param {String} body - test of the new Post
   */
  function create({ author, body }) {
    console.log()
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
    const moduleName = appEvent.payload();
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = false;

      for (let item of outbox) {
        console.log(item);
      }
    }
  }

  /** 
   * Handles the `application.info.moduleStopped` event
   * @param {AppEvent} appEvent - an instance of the {AppEvent} interface
   */
  function onModuleStopped(appEvent) {
    const moduleName = appEvent.payload();
    if (moduleName === '/lib/jainky-module') {
      jainkyModuleDown = true;
    }
  }


}
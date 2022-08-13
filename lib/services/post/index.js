import { randomUUID } from 'crypto';
import IPostRepository from '../../../src/interfaces/post-repository.js';
import SequenceId from './sequence-id.js';

/**
 * All write data required to update the database in the event a given service cannot perform writes and writes must cached; this object is
 * part of the payload of the `application.writeAheadLogAvailable` event
 * @typedef {Object} WALAvailableConfiguration
 * @property {Array} entries - a list of write attempts cached in the Write-Ahead Log
 * @property {String} serviceName - the name of the service whose write attempts can be retried
 * @memberof module:PostService          
 */


/**
 * Provides CRUD methods for `Posts` and for managing the datastore associated with `Posts`. 
 * _Methods referenced below are exposed on the application core under `sandbox.my.postService` namespace._
 * @module PostService
 * @param {Object} sandbox - default sandboxed APIs
 */
export default function PostService(sandbox) {
    const { ApplicationError } = sandbox.get('errors');
    const console = sandbox.get('console');
    const events = sandbox.get('/plugins/events-authz');
    const subscriberId = 'postService';
    let myRepository = IPostRepository();
    let lastSequenceId;

    /**************** PUBLIC API ****************/
    sandbox.put('postService', {
        create,
        deletePost,
        editPost,
        exists,
        getAllPosts,
        getPostById,
        setRepository
    });

    /**************** EVENT REGISTRATION ****************/
    events.on({ event: 'application.ready', handler: onApplicationReady, subscriberId });
    events.on({ event: 'application.writeAheadLogAvailable', handler: onWriteAheadLogAvailable, subscriberId });

    /**
     * Helper function for generating errors
     * @param {String} code - an error code to refer to in any error documentation
     * @param {String} message - a message to log
     * @memberof module:PostService
     * @returns {ApplicationError}
    */
    function onError(code, message) {
        return ApplicationError({
            code,
            message,
            name: 'LibPostServiceError',
            module: '/lib/services/post',
        });
    }

    /**
     * Registers a chaos experiment on the `application.ready` event
    */
    /* istanbul ignore next */
    // Reason: The `chaos.experiment.registrationRequested` event handler is currently covered in the integration test of 
    // the chaos plugin. Chaos experiments are opt-in by modules and *may* not stay in the codebase long-term
    function onApplicationReady() {
        events.notify('application.chaos.experiment.registrationRequested', {
            name: 'unsetRepository',
            start: function () {
                setRepository({});
            }
        });
    }

    /**
     * Provides access to log of previous create or update attempts on the PostRepository for retrying
     * @param {AppEvent} appEvent - an instance of the `AppEvent` whose payload satisfies the `WALAvailableConfiguration` interface
     * @memberof module:PostService
     */
    /* istanbul ignore next */
    function onWriteAheadLogAvailable(appEvent) {
        const { entries, serviceName } = appEvent.payload();
        const cachedWrites = entries.filter((entry) => entry.next.module === serviceName && entry.sequenceId > lastSequenceId)
            .map((entry) => myRepository[entry.operation]({ ...entry.next, sequenceId: entry.sequenceId }));

        Promise.all(cachedWrites);
    }

    /**
     * Sets the repository for the service to use
     * @param {Object} repo - an object having the {IPostRepository} interface 
     * @memberof module:PostService
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
     * @param {String} id
     * @param {String} authorId
     * @param {String} body
     * @memberof module:PostService
     * @returns {Object} - the newly created `Post`
    */
    async function create({ id = `/posts/${randomUUID()}`, authorId, body }) {
        const sequenceId = SequenceId();
        events.notify('application.postService.post.writeRequestReceived', {
            id,
            authorId,
            body,
            sequenceId,
            serviceName: 'postService',
            operation: 'create'
        });

        const post = await myRepository.create({ id, authorId, body, sequenceId });
        lastSequenceId = sequenceId;
        
        return { data: [post], entries: 1 };
    }

    /**
     * Deletes an existing `Post` on the data store
     * @param {String} id
     * @memberof module:PostService
     * @returns {Array} - an empty list
    */
    async function deletePost(id) {
        const result = await myRepository.deletePost(id);
        return { data: result, entries: 0 };
    }

    /**
     * Updates an existing `Post` on the data store
     * @param {String} id
     * @param {String} body
     * @memberof module:PostService
     * @returns {Array} - a list containing the updated `Post`
    */
    async function editPost({ id, body }) {
        const post = await  myRepository.editPost({ id, body });
        return { data: [post], entries: 1 }
    }

    /**
     * Indicates whether a `Post` exists
     * @param {String} id
     * @memberof module:PostService
     * @returns {Boolean} 
    */
    async function exists(id) {
        const result = await myRepository.exists(id);
        return { 
            exists: result, 
            summary: { 
                exists : result, 
                entries: Number(result) 
            }
        };
    }

    /**
     * Returns list of `Posts` from the data store
     * @memberof module:PostService
     * @returns {Array} - a list of `Posts`
    */
    async function getAllPosts() {
        const posts = await myRepository.getAllPosts();
        return { data: posts , entries: posts.length };
    }

    /**
     * Fetches a single `Post` from the data store
     * @param {String} id
     * @memberof module:PostService
     * @returns {Object} - a list of `Posts`
    */
    async function getPostById(id) {
        const post = await myRepository.getPostById(id);
        return { data: post, entries: 1 };
    }
}
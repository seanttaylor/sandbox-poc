import { faker } from '@faker-js/faker';
import PostService from '../../lib/services/post/index.js';
import PostRepository from '../../lib/repos/post/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';
import PluginEventAuthz from '../../lib/plugins/event-authz/index.js';

/**
 * This test suite verifies the Post Service functionality.
 */
describe('PostService', () => {
    test('Should NOT be able to call methods on the PostService before a repository has been set with `setRepository`', async () => {
        try {
            const sandbox = {};
            const { controller } = SandboxController(sandbox);
            PostService(controller);

            const postService = sandbox.my.postService;
            await postService.create({ author: faker.datatype.uuid(), body: faker.hacker.phrase() });
        } catch (e) {
            expect(e.message).toMatch('Missing implementation');
        }
    });

    test('Should be able to create a new `Post`', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        const result = await postService.create({ authorId, body });

        expect(Object.keys(result).includes('id')).toBe(true);
        expect(result.body === body).toBe(true);
        expect(result.authorId === authorId).toBe(true);
    });

    test('Should be able to edit an existing `Post`', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const newBody = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        const { id } = await postService.create({ authorId, body });
        const updatedPost = await postService.editPost({ id, body: newBody });

        expect(updatedPost.body === newBody).toBe(true);
        expect(updatedPost.id === id).toBe(true);
        expect(updatedPost.authorId === authorId).toBe(true);
    });

    test('Should be able to delete an existing `Post`', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const newBody = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        const { id } = await postService.create({ authorId, body });
        const result = await postService.deletePost(id);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length === 0).toBe(true);
    });

    test('Should be able to determine the existence of a `Post` using an id', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        const { id } = await postService.create({ authorId, body });
        const result = await postService.exists(id);

        expect(result).toBe(true);
    });

    test('Should be able to get all instances of `Post` in the datastore', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        await postService.create({ authorId, body });
        const result = await postService.getAllPosts();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length > 0).toBe(true);
    });

    test('Should be able to get an instance of `Post` by id from the data store', async () => {
        const authorId = `/users/${faker.datatype.uuid()}`;
        const body = faker.hacker.phrase();
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const postRepo = sandbox.my.postRepo;

        postService.setRepository(postRepo);

        const { id } = await postService.create({ authorId, body });
        const result = await postService.getPostById(id);

        expect(result.id === id).toBe(true);
        expect(result.body === body).toBe(true);
    });

    test('Setting no repository should do nothing and return undefined', async () => {
        const sandbox = {};
        const { controller } = SandboxController(sandbox);

        PluginEventAuthz(controller);
        PostRepository(controller);
        PostService(controller);

        const postService = sandbox.my.postService;
        const result = postService.setRepository();

        expect(result).toBeUndefined();
    });
});
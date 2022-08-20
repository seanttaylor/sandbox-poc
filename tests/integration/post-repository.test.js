
import { faker } from '@faker-js/faker';
import pluginEventAuthz from '../../lib/plugins/event-authz/index.js';
import PostRepository from '../../lib/repos/post/index.js';
import SandboxController from '../../src/sandbox-controller/index.js';

/**
 * This test suite tests the public methods the PostRepository API and client-defined Plugin intialization. 
 */
describe('PostRepository API', () => {
    // SandboxController augments sandbox with a method for registering the public API of application modules (e.g. the PostRepository module)
    const sandbox = {};
    const { controller } = SandboxController(sandbox);
    // The controller applies the API of the module to the sandbox
    pluginEventAuthz(controller);
    PostRepository(controller);

    test('Should be able to create a new Post', async () => {
        const authorId = "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d";
        const body = faker.hacker.phrase();
        const record = await sandbox.my.postRepo.create({
          id: `/posts/${faker.datatype.uuid()}`,
          authorId,
          body
        });

        expect(record.id).toBeTruthy();

        expect(typeof (record.id)).toEqual('string');
        expect(typeof (record.body)).toEqual('string');

        expect(record.authorId).toEqual(authorId);
        expect(record.body).toEqual(body);
    });

    test('Should be able to retrieve an existing Post', async () => {
        const authorId = "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d";
        const body = faker.hacker.phrase();
        const record = await sandbox.my.postRepo.create({
            id: `/posts/${faker.datatype.uuid()}`,
            authorId,
            body
        });

        const [retrievedPost] = await sandbox.my.postRepo.getPostById(record.id);

        expect(retrievedPost.id).toEqual(record.id);
        expect(retrievedPost.authorId).toEqual(authorId);
        expect(retrievedPost.body).toEqual(body);
    });

    test('Should be able to retrieve all existing Posts', async () => {
        const authorId = "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d";
        const body = faker.hacker.phrase();
        await sandbox.my.postRepo.create({
            id: `/posts/${faker.datatype.uuid()}`,
            authorId,
            body
        });

        const retrievedPosts = await sandbox.my.postRepo.getAllPosts();

        expect(Array.isArray(retrievedPosts)).toEqual(true);
        expect(typeof (retrievedPosts[0]['id'])).toEqual('string');
    });

    test('Should be able to retrieve all existing Posts by a specified `authorId`', async () => {
        const authorId = "/users/b20cdf59-b121-4b00-9e43-d2c48e2cf98f";
        const body = faker.hacker.phrase();
        await sandbox.my.postRepo.create({
            id: `/posts/${faker.datatype.uuid()}`,
            authorId,
            body
        });

        const retrievedPosts = await sandbox.my.postRepo.getPostsByAuthorId(authorId);

        expect(Array.isArray(retrievedPosts)).toEqual(true);
        expect(retrievedPosts.length).toEqual(1);

        expect(typeof (retrievedPosts[0]['authorId'])).toEqual('string');
        expect(retrievedPosts[0]['authorId']).toEqual(authorId);
    });

    test('Should be able to edit an existing Post`', async () => {
        const authorId = "/users/b20cdf59-b121-4b00-9e43-d2c48e2cf98f";
        const body = faker.hacker.phrase();
        const editedBody = "Baby's first edit";

        const post = await sandbox.my.postRepo.create({
            id: `/posts/${faker.datatype.uuid()}`,
            authorId,
            body
        });

        const editedPost = await sandbox.my.postRepo.editPost({
            id: post.id,
            body: editedBody
        });

        expect(editedPost.id).toEqual(post.id);
        expect(editedPost.body).toEqual(editedBody);
    });

    test('Should be able to delete an existing Post', async () => {
        const authorId = "/users/b20cdf59-b121-4b00-9e43-d2c48e2cf98f";
        const body = faker.hacker.phrase();
        const post = await sandbox.my.postRepo.create({
            id: `/posts/${faker.datatype.uuid()}`,
            authorId,
            body
        });

        const deletedPost = await sandbox.my.postRepo.deletePost(post.id);
        expect(Array.isArray(deletedPost)).toBe(true);
        expect(deletedPost.length).toEqual(0);

        const nonExistentPost = await sandbox.my.postRepo.getPostById(post.id);
        expect(Array.isArray(nonExistentPost)).toBe(true);
        expect(nonExistentPost.length).toEqual(0);
    });

    test('Should be able to check if a Post exists in the data store', async () => {
        const bogusPostId = `${faker.datatype.uuid()}`;
        const postExists = await sandbox.my.postRepo.exists(bogusPostId);

        expect(postExists).toBe(false);
    });

    test('Should be able to get an empty array when non-existent id is given for to `getPostById`', async () => {
        const bogusPostId = `${faker.datatype.uuid()}`;
        const nonExistentPost = await sandbox.my.postRepo.getPostById(bogusPostId);

        expect(Array.isArray(nonExistentPost)).toBe(true);
        expect(nonExistentPost.length === 0).toBe(true);
    });
});
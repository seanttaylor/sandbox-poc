// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property
import MockSandboxFactory from '../../../mocks/mock-sandbox-factory.js';
import PostRepository from '../../../../lib/repos/post/index.js';

/**
 * This test suite verifies the PostRepository interface.
 */
describe('PostRepository Initialization', () => {
    test('Should register the PostRepository API on the sandbox on module initialization via `put`', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(myBox.get('/plugins/events-authz').on.mock.calls.length).toBe(2);
        expect(myBox.put.mock.calls.length).toBe(1);
    });

    test('Should expose the `postRepo.create` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(myBox.put.mock.calls.length).toBe(1);
        // The first argument of the first call to the `put` was 'postRepo', the namespace of the PostRepository API.
        expect(myBox.put.mock.calls[0][0]).toBe('postRepo');
        // The second argument of the first call to the `put` was an object with a `create` method.
        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('create')).toBe(true);
    });

    test('Should expose the `postRepo.getPostById` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('getPostById')).toBe(true);
    });

    test('Should expose the `postRepo.getAllPosts` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('getAllPosts')).toBe(true);
    });

    test('Should expose the `postRepo.getAllPosts` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('getAllPosts')).toBe(true);
    });

    test('Should expose the `postRepo.getPostsByAuthorId` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('getPostsByAuthorId')).toBe(true);
    });

    test('Should expose the `postRepo.deletePost` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('deletePost')).toBe(true);
    });

    test('Should expose the `postRepo.editPost` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('editPost')).toBe(true);
    });

    test('Should expose the `postRepo.exists` method on the sandbox', async () => {
        const myBox = MockSandboxFactory();
        PostRepository(myBox);

        expect(Object.keys(myBox.put.mock.calls[0][1]).includes('exists')).toBe(true);
    });
});
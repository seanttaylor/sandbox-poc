import { faker } from '@faker-js/faker';
import PluginHypermediaPost from '../../../lib/plugins/hypermedia/post/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';
import MockPostService from '../../mocks/services/mock-post-service.js';

/**
 * This test suite verifies Hypermedia Post plugin API.
 */
describe('HypermediaPostPlugin', () => {

    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        
        PluginHypermediaPost(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should call the `plugin` method with the plugin configuration', async () => {
        const mockSandbox = MockSandBoxFactory();

        PluginHypermediaPost(mockSandbox);

        expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);

        // This plugin does not extend a default sandbox API so the `of` property is not required
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(false);
    });

    test('Should call the `fn` method defined on the plugin configuration to launch the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);

        // Validate the plugin returns the correct API
        expect(typeof (testPlugin)).toBe('object');
        expect(Object.keys(testPlugin).includes('create')).toBe(true);
        expect(Object.keys(testPlugin).includes('deletePost')).toBe(true);
        expect(Object.keys(testPlugin).includes('editPost')).toBe(true);
        expect(Object.keys(testPlugin).includes('getAllPosts')).toBe(true);
        expect(Object.keys(testPlugin).includes('getPostById')).toBe(true);
    });

    test('Should return embedded `Post` resource for `getAllPosts` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });
        const posts = await testPlugin.getAllPosts();

        // Validate the plugin returns the correct API
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(posts).includes('_links')).toBe(true);
        expect(Object.keys(posts).includes('_embedded')).toBe(true)
        expect(Array.isArray(posts['_embedded']['sandbox:posts'])).toBe(true);
    });

    test('Should return `Post` resource for `getPostById` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        const result = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });
        
        const post = await testPlugin.getPostById(result.id);

        // Validate the plugin returns the correct API
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(post).includes('_links')).toBe(true);
        expect(Object.keys(post._links).includes('self')).toBe(true);
        expect(Object.keys(post._links).includes('curies')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:index')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:posts')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:users')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:user-posts')).toBe(true);
    });

    test('Should return `Post` resource for `editPost` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testUpdate = faker.hacker.phrase();
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        const result = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });
        const post = await testPlugin.editPost({ id: result.id, body: testUpdate });

        // Validate the plugin returns the correct API
        expect(post.body === testUpdate).toBe(true);
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(post).includes('_links')).toBe(true);
        expect(Object.keys(post._links).includes('self')).toBe(true);
        expect(Object.keys(post._links).includes('curies')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:index')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:posts')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:users')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:user-posts')).toBe(true);
    });

    test('Should return `Post` resource for `deletePost` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        const result = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });
        const post = await testPlugin.deletePost(result.id);

        // Validate the plugin returns the correct API
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(post).includes('_links')).toBe(true);
        expect(Object.keys(post._links).includes('self')).toBe(true);
        expect(Object.keys(post._links).includes('curies')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:index')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:posts')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:users')).toBe(true);
        expect(Object.keys(post._links).includes('sandbox:user-posts')).toBe(true);
    });

    test('Should be able to return a representation for a *non-existent* `Post` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        const createdPost = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });
        await testPlugin.deletePost(createdPost.id);

        const HAL = await testPlugin.exists(createdPost.id);

        // Validate the plugin returns the correct API
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(HAL.response).includes('_links')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('self')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('curies')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:index')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:posts')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:users')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:user-posts')).toBe(true);
    });

    test('Should return a representation for an existing `Post` in HAL format', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();

        PluginHypermediaPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](mockPostService);
        const createdPost = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });

        const HAL = await testPlugin.exists(createdPost.id);

        // Validate the plugin returns the correct API
        expect(typeof(testPlugin)).toBe('object');
        expect(Object.keys(HAL.response).includes('_links')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('self')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('curies')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:index')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:posts')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:users')).toBe(true);
        expect(Object.keys(HAL.response._links).includes('sandbox:user-posts')).toBe(true);
    });

});
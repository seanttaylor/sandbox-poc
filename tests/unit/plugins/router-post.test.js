// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import { faker } from '@faker-js/faker';
import PluginPostRouter from '../../../lib/plugins/router/post/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';
import MockRouterFactory from '../../mocks/mock-router-factory.js';
import MockPostService from '../../mocks/services/mock-post-service.js';

/**
 * This test suite verifies PostRouter plugin functionality.
 */
describe('PluginPostRouter', () => {

    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginPostRouter(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should call the `plugin` method with the plugin configuration', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginPostRouter(mockSandbox);

        expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);

        // This plugin does not extend a default sandbox API so the `of` property is not required
        expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(false);
    });

    test('Should call the `fn` method defined on the plugin configuration to launch the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();

        PluginPostRouter(mockSandbox);

        // Create a plugin instance and provide it with dependencies
        const mockPlugin = mockSandbox.plugin.mock.calls[0][0]['fn'](MockRouterFactory());

        // Validate the plugin returns the correct API
        expect(typeof (mockPlugin)).toBe('object');
        expect(Object.keys(mockPlugin).includes('get')).toBe(true);
    });

    test('Should be able to get a list of `Post` instances via the router plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockRouter = MockRouterFactory();
        const mockPost = {
            id: `/posts/${faker.datatype.uuid()}`,
            body: faker.hacker.phrase(),
        };
        // We modify the mocked `getAllPosts` method here because we assert that the `mockPost` variable is returned by the method. We
        // need to retain a reference to `mockPost` for use in the `expect` call
        const mockPostService = Object.assign(MockPostService(), {
            getAllPosts: () => [mockPost]
        });

        const json = jest.fn();
        const set = jest.fn();
        const status = jest.fn();

        PluginPostRouter(mockSandbox);

        // Create a plugin instance and provide it with dependencies
        mockSandbox.plugin.mock.calls[0][0]['fn'](mockRouter, mockPostService);

        // Validate the mocked router `get` method is called to register the '/' route with a handler
        expect(mockRouter.get.mock.calls[0][0] === '/posts').toBe(true);
        expect(typeof (mockRouter.get.mock.calls[0][1]) === 'function').toBe(true);

        // Call the registered route handler with bogus request and response objects
        // The route handler is async so we have to `await` here
        await mockRouter.get.mock.calls[0][1]({}, { json, set, status });

        // Verify response object methods are called
        expect(set.mock.calls.length === 1).toBe(true);
        expect(status.mock.calls.length === 1).toBe(true);
        expect(json.mock.calls.length === 1).toBe(true);

        expect(set.mock.calls[0][0] === 'content-type').toBe(true);
        expect(set.mock.calls[0][1] === 'application/json').toBe(true);

        expect(status.mock.calls[0][0] === 200).toBe(true);

        // Verify the route handler returns the a list of `Post` instances
        expect(Array.isArray(json.mock.calls[0][0])).toBe(true);

        // Because this handler returns a list we need to use a third pair of brackets to access the first list item in the response
        expect(json.mock.calls[0][0][0]['id'] === mockPost.id).toBe(true);
        expect(json.mock.calls[0][0][0]['body'] === mockPost.body).toBe(true);
    });

    test('Should be able to get a single `Post` instance by id via the router plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockRouter = MockRouterFactory();
        const mockPost = {
            id: `/posts/${faker.datatype.uuid()}`,
            body: faker.hacker.phrase(),
        };
        // We add a mock `getPostById` method here because we assert that the `mockPost` variable is returned by the method. We
        // need to retain a reference to `mockPost` for use in the `expect` call
        const mockPostService = Object.assign(MockPostService(), {
            getPostById: (id) => { return id === mockPost.id ? [mockPost] : [] }
        });

        const json = jest.fn();
        const set = jest.fn();
        const status = jest.fn();

        PluginPostRouter(mockSandbox);

        // Create a plugin instance and provide it with dependencies
        mockSandbox.plugin.mock.calls[0][0]['fn'](mockRouter, mockPostService);

        // Validate the mocked router `get` method is called to register the '/posts/:id' route with a handler
        expect(mockRouter.get.mock.calls[1][0] === '/posts/:id').toBe(true);
        expect(typeof (mockRouter.get.mock.calls[0][1]) === 'function').toBe(true);

        // Call the registered route handler with bogus request and response objects
        // The route handler is async so we have to `await` here
        await mockRouter.get.mock.calls[1][1]({ url: mockPost.id }, { json, set, status });

        // Verify response object methods are called
        expect(set.mock.calls.length === 1).toBe(true);
        expect(status.mock.calls.length === 1).toBe(true);
        expect(json.mock.calls.length === 1).toBe(true);

        expect(set.mock.calls[0][0] === 'content-type').toBe(true);
        expect(set.mock.calls[0][1] === 'application/json').toBe(true);

        expect(status.mock.calls[0][0] === 200).toBe(true);

        // Verify the route handler returns the a list of `Post` instances
        expect(Array.isArray(json.mock.calls[0][0])).toBe(true);

        // Because this handler returns a list we need to use a third index to access the first list item in the response
        expect(json.mock.calls[0][0][0]['id'] === mockPost.id).toBe(true);
        expect(json.mock.calls[0][0][0]['body'] === mockPost.body).toBe(true);
    });

    test('Should be able to create a single `Post` instance via the router plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockRouter = MockRouterFactory();

        // We add a mock `create` method here because we assert that the `mockPost` variable is returned by the method. We
        // need to retain a reference to `mockPost` for use in the `expect` call
        const mockPostService = Object.assign(MockPostService(), {
            create: ({ authorId, body }) => { return [{ authorId, body, }] }
        });
        const json = jest.fn();
        const set = jest.fn();
        const status = jest.fn();
        const mockBody = faker.hacker.phrase();
        const mockAuthorId = `/users/${faker.datatype.uuid()}`;

        PluginPostRouter(mockSandbox);

        // Create a plugin instance and provide it with dependencies
        mockSandbox.plugin.mock.calls[0][0]['fn'](mockRouter, mockPostService);

        // Validate the mocked router `post` method is called to register the '/posts' route with a handler
        expect(mockRouter.post.mock.calls[0][0] === '/posts').toBe(true);
        expect(typeof (mockRouter.post.mock.calls[0][1]) === 'function').toBe(true);

        // Call the registered route handler with bogus request and response objects
        // The route handler is async so we have to `await` here
        await mockRouter.post.mock.calls[0][1]({ body: { body: mockBody, authorId: mockAuthorId } }, { json, set, status });

        // Verify response object methods are called
        expect(set.mock.calls.length === 1).toBe(true);
        expect(status.mock.calls.length === 1).toBe(true);
        expect(json.mock.calls.length === 1).toBe(true);

        expect(set.mock.calls[0][0] === 'content-type').toBe(true);
        expect(set.mock.calls[0][1] === 'application/json').toBe(true);

        expect(status.mock.calls[0][0] === 200).toBe(true);

        // Verify the route handler returns the a list of `Post` instances
        expect(Array.isArray(json.mock.calls[0][0])).toBe(true);

        // Because this handler returns a list we need to use a third index to access the first list item in the response
        expect(json.mock.calls[0][0][0]['authorId'] === mockAuthorId).toBe(true);
        expect(json.mock.calls[0][0][0]['body'] === mockBody).toBe(true);
    });
});
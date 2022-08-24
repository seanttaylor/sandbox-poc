// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import { fileURLToPath } from 'url';
import path from 'path';
import PluginHTMLPost from '../../../lib/plugins/html/post/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';
import MockPostService from '../../mocks/services/mock-post-service.js';
import { faker } from '@faker-js/faker';

const templateDirectory = path.resolve(__dirname, '../../../views');
const evergreenPostId = '/posts/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09';

/**
 * This test suite verifies EventAuthz plugin functionality.
 */
describe('PluginHTMLPost', () => {

    test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
        const mockSandbox = MockSandBoxFactory();
        PluginHTMLPost(mockSandbox);

        expect(mockSandbox.plugin.mock.calls.length).toBe(1);
    });

    test('Should be able to render the result of `PostService.getAllPosts` as HTML', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTMLResponse = await testPlugin.getAllPosts();

        expect(typeof(HTMLResponse) === 'string').toBe(true);
        expect(HTMLResponse.includes('<title>Get All Posts</title>')).toBe(true);
    });

    test('Should be able to render the result of `PostService.create` as HTML', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTMLResponse = await testPlugin.create({
            authorId: faker.datatype.uuid(),
            body: faker.hacker.phrase()
        });

        expect(typeof(HTMLResponse) === 'string').toBe(true);
        expect(HTMLResponse.includes('<title>New Post</title>')).toBe(true);
    });

    test('Should be able to render the result of `PostService.getPostById` as HTML', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTMLResponse = await testPlugin.getPostById(evergreenPostId);

        expect(typeof(HTMLResponse) === 'string').toBe(true);
        expect(HTMLResponse.includes('<title>Get Post By Id</title>')).toBe(true);
        expect(HTMLResponse.includes(evergreenPostId)).toBe(true);
    });

    test('Should be able to render the result of `PostService.editPost` as HTML', async () => {
        const updatedPostBody = faker.hacker.phrase();
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTMLResponse = await testPlugin.editPost({
            id: evergreenPostId,
            body: updatedPostBody
        });

        expect(typeof(HTMLResponse) === 'string').toBe(true);
        expect(HTMLResponse.includes('<title>Post</title>')).toBe(true);
    });

    test('Should be able to render the result of `PostService.deletePost` as HTML', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTMLResponse = await testPlugin.deletePost(evergreenPostId);

        expect(typeof(HTMLResponse) === 'string').toBe(true);
        expect(HTMLResponse.includes('<a href=/www/posts/index.html>Posts</a>')).toBe(true);
    });

    test('Should be able to render the result of fetching a *non-existent* Post via `PostService.exists` as HTML', async () => {
        const mockSandbox = MockSandBoxFactory();
        const mockPostService = MockPostService();
        PluginHTMLPost(mockSandbox);

        // Create a test plugin instance and provide it with dependencies
        const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
        const HTML = await testPlugin.exists('foo');

        expect(typeof(HTML.response) === 'string').toBe(true);
        expect(HTML.response.includes('Post Not Found')).toBe(true);
    });

    test('Should be able to render the result of fetching a Post via `PostService.exists` as HTML', async () => {
      const mockSandbox = MockSandBoxFactory();
      const mockPostService = MockPostService();
      PluginHTMLPost(mockSandbox);

      // Create a test plugin instance and provide it with dependencies
      const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
      const HTML = await testPlugin.exists(evergreenPostId);

      expect(typeof(HTML.response) === 'string').toBe(true);
      expect(HTML.response.includes(`Post(${evergreenPostId})`)).toBe(true);
    });

    test('Should be able to render a generic HTML page on 400 HTTP status', async () => {
      const mockSandbox = MockSandBoxFactory();
      const mockPostService = MockPostService();
      PluginHTMLPost(mockSandbox);

      // Create a test plugin instance and provide it with dependencies
      const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
      const HTML = await testPlugin.getErrorResponse(400);

      expect(typeof(HTML) === 'string').toBe(true);
      expect(HTML.includes('Client Error')).toBe(true);
    });

    test('Should be able to render a preview of a draft post as HTML', async () => {
      const mockSandbox = MockSandBoxFactory();
      const mockPostService = MockPostService();
      PluginHTMLPost(mockSandbox);

      // Create a test plugin instance and provide it with dependencies
      const testPlugin = mockSandbox.plugin.mock.calls[0][0]['fn']({ templateRootPath: templateDirectory }, mockPostService);
      const HTML = await testPlugin.getPostPreview({ body: "I'm a preview!" });

      expect(typeof(HTML) === 'string').toBe(true);
      expect(HTML.includes("I'm a preview!")).toBe(true);
    });
});
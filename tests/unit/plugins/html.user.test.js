// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import path from 'path';
import { faker } from '@faker-js/faker';
import { describe, expect, test } from '@jest/globals';
import PluginHTMLUser from '../../../lib/plugins/html/user/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';
import MockUserService from '../../mocks/services/mock-user-service.js';

const templateDirectory = path.resolve(__dirname, '../../../views');
const evergreenUserId = '/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d';

/**
 * This test suite verifies HTMLUser plugin functionality, specifically successful HTML page rendering
 * Validation of the correctly rendered DOM elements is *not* part of this test suite
 */
describe('PluginHTMLUser', () => {
  test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
    const mockSandbox = MockSandBoxFactory();
    PluginHTMLUser(mockSandbox);

    expect(mockSandbox.plugin.mock.calls.length).toBe(1);
  });

  test('Should be able to render the result of `UserService.getAllUsers` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.getAllUsers();

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('<title>Get All Users</title>')).toBe(true);
  });

  test('Should be able to render the result of `UserService.create` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    // Create a test plugin instance and provide it with dependencies
    // This call to create method takes no arguments because the mockUserService generates fake user  data internally
    const HTMLResponse = await testPlugin.create();

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('<title>Nicely | Your Account</title>')).toBe(true);
  });

  test('Should be able to render the result of `UserService.getUserById` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.getUserById(evergreenUserId);

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('<title>Nicely | Get User By Id</title>')).toBe(true);
    expect(HTMLResponse.includes(evergreenUserId)).toBe(true);
  });

  test('Should be able to render the result of `UserService.editName` as HTML', async () => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.editName({
      id: evergreenUserId,
      name: {
        firstName,
        lastName,
      },
    });

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes(`${firstName}`)).toBe(true);
    expect(HTMLResponse.includes(`${lastName}`)).toBe(true);
  });

  test('Should be able to render the result of `UserService.editMotto` as HTML', async () => {
    const updatedMotto = 'Always bet on black';
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.editMotto({ id: evergreenUserId, motto: updatedMotto });

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes(updatedMotto)).toBe(true);
  });

  test('Should be able to render the result of `UserService.editEmailAddress` as HTML', async () => {
    const updatedEmail = faker.internet.email();
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.editEmailAddress({ id: evergreenUserId, emailAddress: updatedEmail });

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes(updatedEmail)).toBe(true);
  });

  test('Should be able to render the result of `UserService.login` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const response = await mockUserService.create();
    const [mockUser] = response.data;
    const HTMLResponse = await testPlugin.login(mockUser);

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes(`Welcome ${mockUser.firstName}`)).toBe(true);
  });

  test('Should be able to render the result of `UserService.deleteUser` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.deleteUser(evergreenUserId);

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('<title>Deleted successfully</title>')).toBe(true);
  });

  test('Should be able to render the result of `UserService.exists` as HTML', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const { response: HTMLResponse } = await testPlugin.exists(evergreenUserId);

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('Nicely | Existence Result')).toBe(true);
  });

  test('Should be able to render a generic HTML page on 400 HTTP status', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTML = await testPlugin.getErrorResponse(400);

    expect(typeof (HTML) === 'string').toBe(true);
    expect(HTML.includes('Bad Request')).toBe(true);
  });

  test('Should be able to render a generic HTML page on 401 HTTP status', async () => {
    const mockSandbox = MockSandBoxFactory();
    const mockUserService = MockUserService();
    PluginHTMLUser(mockSandbox);

    // Create a test plugin instance and provide it with dependencies
    const testPlugin = mockSandbox.plugin.mock.calls[0][0].fn({ templateRootPath: templateDirectory }, mockUserService);
    const HTMLResponse = await testPlugin.getErrorResponse(401);

    expect(typeof (HTMLResponse) === 'string').toBe(true);
    expect(HTMLResponse.includes('data-name="unauthorized-error"')).toBe(true);
  });
});

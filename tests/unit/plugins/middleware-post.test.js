// For more info about the Jest mocking APIs see: https://jestjs.io/docs/mock-functions#mock-property

import { describe, expect, test } from '@jest/globals';
import PluginMiddlewarePost from '../../../lib/plugins/middleware/post/index.js';
import MockSandBoxFactory from '../../mocks/mock-sandbox-factory.js';

/**
 * This test suite verifies Middleware Post plugin API.
 */
describe('PluginMiddlewarePost', () => {
  test('Should call the `plugin` method defined on the sandbox to register the plugin', async () => {
    const mockSandbox = MockSandBoxFactory();

    PluginMiddlewarePost(mockSandbox);

    expect(mockSandbox.plugin.mock.calls.length).toBe(1);
  });

  test('Should call the `plugin` method with the plugin configuration', async () => {
    const mockSandbox = MockSandBoxFactory();

    PluginMiddlewarePost(mockSandbox);

    expect(typeof (mockSandbox.plugin.mock.calls[0][0])).toEqual('object');
    expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('extendsDefault')).toEqual(true);
    expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('fn')).toEqual(true);
    expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('name')).toEqual(true);

    // This plugin does not extend a default sandbox API so the `of` property is not required
    expect(Object.keys(mockSandbox.plugin.mock.calls[0][0]).includes('of')).toEqual(false);
  });
});

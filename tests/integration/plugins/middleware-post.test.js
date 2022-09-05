import {
  describe, expect, jest, test,
} from '@jest/globals';
import PluginMiddlewarePost from '../../../lib/plugins/middleware/post/index.js';
import SandboxController from '../../../src/sandbox-controller/index.js';

describe('PluginMiddlewarePost', () => {
  test('Should expose the MiddlewarePost API', async () => {
    const sandbox = {};
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();

    expect(Object.keys(pluginMiddlewarePost).includes('authenticateIncomingRequest')).toBe(true);
    expect(Object.keys(pluginMiddlewarePost).includes('validateIncomingRequest')).toBe(true);
  });

  test('Should report an error on failure to authenticate an incoming request', async () => {
    const sandbox = {};
    const events = {
      notify: jest.fn(),
    };
    const next = jest.fn();
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const middlewareFunction = pluginMiddlewarePost.authenticateIncomingRequest({}, events);
    middlewareFunction({
      headers: {},
      cookies: {},
    }, {}, next);

    expect(events.notify.mock.calls.length === 1).toBe(true);
    expect(events.notify.mock.calls[0][0] === 'application.error').toBe(true);
    expect(events.notify.mock.calls[0][1].code === 'service.error').toBe(true);
  });

  test('Should be to authenticate an incoming request with authorization token', async () => {
    const sandbox = {};
    const fakeToken = 'fakeToken';
    const events = {
      notify: jest.fn(),
    };
    const next = jest.fn();
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const userAuthn = {
      validateAuthnCredential: jest.fn().mockImplementation(() => true),
    };
    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const middlewareFunction = pluginMiddlewarePost.authenticateIncomingRequest(userAuthn, events);

    middlewareFunction({
      headers: {
        authorization: fakeToken,
      },
      cookies: {},
    }, {}, next);

    expect(userAuthn.validateAuthnCredential.mock.calls.length === 1).toBe(true);
    expect(userAuthn.validateAuthnCredential.mock.calls[0][0] === fakeToken).toBe(true);
  });

  test('Should be to authenticate an incoming request with a cookie', async () => {
    const sandbox = {};
    const fakeCookie = 'fakeCookie';
    const events = {
      notify: jest.fn(),
    };
    const next = jest.fn();
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const userAuthn = {
      validateAuthnCredential: jest.fn().mockImplementation(() => true),
    };
    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const middlewareFunction = pluginMiddlewarePost.authenticateIncomingRequest(userAuthn, events);

    middlewareFunction({
      headers: {},
      cookies: {
        'auth-cred': fakeCookie,
      },
    }, {}, next);

    expect(userAuthn.validateAuthnCredential.mock.calls.length === 1).toBe(true);
    expect(userAuthn.validateAuthnCredential.mock.calls[0][0] === fakeCookie).toBe(true);
  });

  test('Should be to able to advance to the next middleware on a valid an incoming request', async () => {
    const sandbox = {};
    const request = {
      url: '/fake/url',
      headers: {
        accept: '*/*',
      },
    };
    const response = {};
    const next = jest.fn();
    const postService = {
      setMediaType: jest.fn(),
      exists: jest.fn().mockImplementation(() => ({ exists: true })),
    };
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const middlewareFunction = pluginMiddlewarePost.validateIncomingRequest(postService);

    await middlewareFunction(request, response, next);

    expect(postService.setMediaType.mock.calls.length === 1).toBe(true);
    expect(postService.setMediaType.mock.calls[0][0] === '*/*').toBe(true);
    expect(next.mock.calls.length === 1).toBe(true);
  });

  test('Should NOT be to able to advance to the next middleware on an INVALID incoming request', async () => {
    const sandbox = {};
    const request = {
      url: '/fake/url',
      headers: {
        accept: '*/*',
      },
    };
    const response = {
      set: jest.fn(),
      status: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const postService = {
      getMediaType: jest.fn(),
      setMediaType: jest.fn(),
      exists: jest.fn().mockImplementation(() => ({ exists: false })),
    };
    const { controller } = SandboxController(sandbox);

    PluginMiddlewarePost(controller);

    const pluginMiddlewarePost = sandbox.my.plugins['/plugins/middleware-post'].load();
    const middlewareFunction = pluginMiddlewarePost.validateIncomingRequest(postService);

    await middlewareFunction(request, response, next);

    expect(postService.setMediaType.mock.calls.length === 1).toBe(true);
    expect(postService.setMediaType.mock.calls[0][0] === '*/*').toBe(true);
    expect(postService.getMediaType.mock.calls.length === 1).toBe(true);
    expect(response.set.mock.calls.length === 1).toBe(true);
    expect(response.status.mock.calls.length === 1).toBe(true);
    expect(response.send.mock.calls.length === 1).toBe(true);

    expect(next.mock.calls.length === 0).toBe(true);
  });
});

import halson from 'halson';

/**
 * Extends [PostService] {@link module:PostService} API, enabling hypermedia responses in the HAL format
 * See (https://stateless.group/hal_specification.html) to learn more about the HAL hypermedia format
 * See (https://en.wikipedia.org/wiki/Hypermedia) to learn about Hypermedia more broadly
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/HypermediaPost
 */
export default function HypermediaPost(sandbox) {
  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/hypermedia-post',
  });

  /**
     * Creates an `Author` hypermedia relation
     * @param {String} authorId - unique id for a `Post` author
     * @returns {Object}
     */
  function UserRelation() {
    return { href: '/api/v1/users' };
  }

  /**
     * Creates an `UserPost` hypermedia relation
     * @param {String} authorId - unique id for a `Post` author
     * @returns {Object}
     */
  function UserPostRelation(authorId) {
    const URL = authorId ? `/api/v1${authorId}` : '/api/v1{user_id}/posts';
    const templated = authorId ? undefined : true;

    return { href: URL, templated };
  }

  /**
     * Creates an `DeletePost` hypermedia relation
     * @param {String} postId - unique id for a `Post`
     * @returns {Object}
     */
  function DeletePostRelation(postId) {
    const URL = postId ? `/api/v1${postId}` : '/api/v1{post_id}';
    const templated = postId === undefined;
    const linkRelation = { href: URL, method: 'delete', name: 'delete' };

    if (templated) {
      linkRelation.templated = templated;
    }

    return linkRelation;
  }

  /**
     * Creates an `EditPost` hypermedia relation
     * @param {String} postId - unique id for a `Post`
     * @returns {Object}
     */
  function EditPostRelation(postId) {
    // Reason: will be covered in automated API tests rather than unit tests
    /* istanbul ignore next */
    const URL = postId ? `/api/v1${postId}` : '/api/v1{id}';
    /* istanbul ignore next */
    const templated = postId ? undefined : true;

    return {
      href: URL, method: 'put', name: 'edit', schema: '/schemas/post/0.0.1/edit.json', templated,
    };
  }

  /**
     * Creates a generic `Post` hypermedia relation; a relation that specifically address creating and reading resources
     * @returns {Object}
     */
  function PostRelation() {
    return {
      href: '/api/v1/posts', method: 'post', name: 'create', schema: '/schemas/post/0.0.1/create.json',
    };
  }

  /**
     * Creates an `APIRoot` hypermedia relation
     * @returns {Object}
     */
  function APIRootRelation() {
    return { href: '/api', title: 'The API root' };
  }

  /**
     * Creates an 'Curies' hypermedia relation
     * @returns {Object}
     */
  function Curies() {
    return [
      {
        name: 'sandbox',
        href: '/docs/relations/{rel}',
        templated: true,
      },
    ];
  }

  /**
     * Takes collection of `Posts` to format as a list HALResources
     * @param {Array} collection - a list of `Posts`
     * @returns {Array}
     */
  function PostCollection(collection) {
    return collection.map((post) => halson(post)
      .addLink({ self: post.id })
      .addLink('sandbox:users', UserRelation(post.authorId))
      .addLink('sandbox:user-posts', UserPostRelation(post.authorId)));
  }

  /** ************** PLUGIN DEFINTION *************** */

  /**
     * Loads the plugin
     * @param {Object} postService - an instance of the PostService interface
     * @memberof module:Plugin/HypermediaPost
     * @returns {Object}
     */
  function myPlugin(postService) {
    /**
         * Wraps the `PostService.create` method's result in HAL formatted response
         * @param {Object} data - required data for a new `Post`
         * @returns {Object}
         */
    async function create(data) {
      const { data: plainResponse } = await postService.create(data);
      const HALResponse = halson(...plainResponse);
      const { id } = plainResponse;

      HALResponse
        .addLink('self', `/api/v1${id}`)
        .addLink('curies', Curies())
        .addLink('sandbox:index', APIRootRelation())
        .addLink('sandbox:posts', [
          PostRelation(),
          EditPostRelation(id),
          DeletePostRelation(id),
        ])
        .addLink('sandbox:users', UserRelation());

      return HALResponse;
    }

    /**
         * Wraps the `PostService.deletePost` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @returns {Object}
         */
    async function deletePost(id) {
      const result = await postService.getPostById(id);
      const [post] = result.data;
      const { authorId } = post;
      const { data: plainResponse } = await postService.deletePost(id);
      const HALResponse = halson(...plainResponse);

      HALResponse
        .addLink('self', { href: null })
        .addLink('curies', Curies())
        .addLink('sandbox:index', APIRootRelation())
        .addLink('sandbox:posts', PostRelation())
        .addLink('sandbox:users', UserRelation())
        .addLink('sandbox:user-posts', UserPostRelation(authorId));

      return HALResponse;
    }

    /**
         * Wraps the `PostService.editPost` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @param {String} body - updated body text for a `Post`
         * @returns {Object}
         */
    async function editPost({ id, body }) {
      const { data: plainResponse } = await postService.editPost({ id, body });
      const HALResponse = halson(...plainResponse);
      const { authorId } = plainResponse;

      HALResponse
        .addLink('self', { href: `/api/v1${id}`, rel: 'post' })
        .addLink('curies', Curies())
        .addLink('sandbox:index', APIRootRelation())
        .addLink('sandbox:posts', [
          PostRelation(),
          DeletePostRelation(id),
        ])
        .addLink('sandbox:users', UserRelation())
        .addLink('sandbox:user-posts', UserPostRelation(authorId));

      return HALResponse;
    }

    /**
         * Wraps the `PostService.exists` method's result in HAL formatted response
         * @param {String} reqId - unique id for a `Post`
         * @returns {Object}
         */
    async function exists(reqId) {
      const result = await postService.exists(reqId);
      const { exists } = result;
      const HALResponse = halson(result);

      HALResponse
        .addLink('self', { href: exists ? `/api/v1${reqId}` : null, rel: exists ? 'post' : null })
        .addLink('curies', Curies())
        .addLink('sandbox:index', APIRootRelation())
        .addLink('sandbox:posts', [
          PostRelation(),
          (exists ? DeletePostRelation(reqId) : DeletePostRelation()),
        ])
        .addLink('sandbox:users', UserRelation())
        .addLink('sandbox:user-posts', UserPostRelation());

      return {
        exists: result.exists,
        response: HALResponse,
      };
    }

    /**
         * Wraps the `PostService.getAllPosts` method's result in HAL formatted response
         * @returns {Object}
         */
    async function getAllPosts() {
      const { data: plainResponse, entries } = await postService.getAllPosts();
      const HALResponse = halson({ entries });

      HALResponse
        .addLink('self', { href: '/api/v1/posts' })
        .addLink('curies', Curies())
        .addLink('index', APIRootRelation())
        .addLink('sandbox:posts', [
          PostRelation(),
          EditPostRelation(),
          DeletePostRelation(),
        ])
        .addEmbed('sandbox:posts', PostCollection(plainResponse));

      return HALResponse;
    }

    /**
         * Wraps the `PostService.getPostById` method's result in HAL formatted response
         * @param {String} id - unique id for a `Post`
         * @returns {Object}
         */
    async function getPostById(id) {
      const { data: plainResponse } = await postService.getPostById(id);
      const HALResponse = halson(...plainResponse);
      const { authorId, id: postId } = plainResponse;

      HALResponse
        .addLink('self', { href: `/api/v1${postId}` })
        .addLink('curies', Curies())
        .addLink('sandbox:index', APIRootRelation())
        .addLink('sandbox:posts', [
          PostRelation(),
          EditPostRelation(postId),
          DeletePostRelation(postId),
        ])
        .addLink('sandbox:users', UserRelation())
        .addLink('sandbox:user-posts', UserPostRelation(authorId));

      return HALResponse;
    }

    return {
      create,
      deletePost,
      exists,
      editPost,
      getAllPosts,
      getPostById,
    };
  }
}

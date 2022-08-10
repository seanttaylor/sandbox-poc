/* istanbul ignore file */

import { faker } from '@faker-js/faker';

const mockPosts = {};

function MockPostFactory() {
    return {
        "id": `/posts/${faker.datatype.uuid()}`,
        "authorId": `/users/${faker.datatype.uuid()}`,
        "body": faker.hacker.phrase(),
        "comments": [],
        "likes": [],
        "lastModifiedTimestamp": null,
        "createdAtTimestamp": faker.datatype.datetime()
    }
};

export default function MockPostService() {
    async function create() {
        const post = MockPostFactory();
        mockPosts[post.id] = post;
        return post;
    }

    async function deletePost(id) {
        delete mockPosts[id];
    }

    async function editPost({ id, body }) {
        mockPosts[id]['body'] = body;
        return mockPosts[id];
    }
    
    async function getAllPosts() {
        const post = MockPostFactory();
        return Object.values(mockPosts);
    }
   
    async function getPostById(id) {
        return [mockPosts[id]];
    }

    

    return {
        create,
        deletePost,
        editPost,
        getAllPosts,
        getPostById
    }
}
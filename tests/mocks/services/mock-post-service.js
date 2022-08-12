/* istanbul ignore file */

import { faker } from '@faker-js/faker';

const mockPosts = {
    "/posts/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09": {
        "id": "/posts/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09",
        "authorId": "/users/2a1acb10-8d2b-4248-a74e-a8418f941dd9",
        "schemaVersion": "0.0.1", 
        "schemaURL": "/schemas/post/0.0.1/post.json", 
        "body": "Hello world! Playboy Billionaire Genius here...",
        "comments": [],
        "likes": [],
        "lastModifiedTimestamp": null,
        "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
    }
};

function MockPostFactory() {
    return {
        "id": `/posts/${faker.datatype.uuid()}`,
        "authorId": `/users/${faker.datatype.uuid()}`,
        "schemaVersion": "0.0.1", 
        "schemaURL": "/schemas/post/0.0.1/post.json", 
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
        return { data: [post], entries: 1 };
    }

    async function deletePost(id) {
        delete mockPosts[id];
        return { data: [], entries: 0 };
    }

    async function editPost({ id, body }) {
        mockPosts[id]['body'] = body;
        return { data: [mockPosts[id]], entries: 1 };
    }
    
    async function getAllPosts() {
       const posts  = Object.values(mockPosts);
       return { data: posts, entries: posts.length };
    }
   
    async function getPostById(id) {
        return { data: [mockPosts[id]], entries: 1};
    }

    function getMediaType() {
        return 'application/hal+json';
    }

    function setMediaType() {
        // Just here to conform to the interface in during test
        // Not supposed to do anything
    }

    return {
        create,
        deletePost,
        editPost,
        getAllPosts,
        getPostById,
        getMediaType,
        setMediaType
    }
}
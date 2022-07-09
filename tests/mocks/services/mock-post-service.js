/* istanbul ignore file */

import { faker } from '@faker-js/faker';

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
    function getAllPosts() {
        const post = MockPostFactory();
        return [post];
    }

    return {
        getAllPosts
    }
}
const mockPostService = {
    getAllPosts: () => { return [mockPost] }
};
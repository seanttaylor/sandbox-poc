/* istanbul ignore file */
// Reason: Schemas are tested when their associated data types are tested.

export default {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "Root Schema",
    "required": [
        "authorId",
        "body",
        "comments",
        "likes",
        "createdAt"
    ],
    "properties": {
        "authorId": {
            "type": "string",
            "default": "",
            "title": "The authorId Schema",
            "examples": [
                "/users/2a1acb10-8d2b-4248-a74e-a8418f941dd9"
            ]
        },
        "sequenceId": {
            "type": "string",
            "default": "",
            "title": "The sequenceId Schema",
            "examples": [
                "-N7cD76LK0xLpypGjJsn"
            ]
        },
        "body": {
            "type": "string",
            "default": "",
            "title": "The body Schema",
            "examples": [
                "Hello world! Plaboy Billionaire Genius here..."
            ]
        },
        "comments": {
            "type": "array",
            "default": [],
            "title": "The comments Schema",
            "items": {},
            "examples": [
                []
            ]
        },
        "likes": {
            "type": "array",
            "default": [],
            "title": "The likes Schema",
            "items": {},
            "examples": [
                []
            ]
        },
        "lastModified": {
            "type": ["string", "null"],
            "default": "null",
            "title": "The lastModifiedTimestamp Schema",
            "examples": [
                "null"
            ]
        },
        "createdAt": {
            "type": "string",
            "default": "",
            "title": "The createdAtTimestamp Schema",
            "examples": [
                "2022-06-26T14:24:04.904Z"
            ]
        }
    },
    "examples": [{
        "authorId": "/users/2a1acb10-8d2b-4248-a74e-a8418f941dd9",
        "sequenceId": "-N7cD76LK0xLpypGjJsn",
        "body": "Hello world! Plaboy Billionaire Genius here...",
        "comments": [],
        "likes": [],
        "lastModified": null,
        "createdAt": "2022-06-26T14:24:04.904Z"
    }]
}
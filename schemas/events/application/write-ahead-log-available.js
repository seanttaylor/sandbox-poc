export default {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The WriteAheadLogAvailable Event Schema",
    "required": [
        "count",
        "entries",
        "serviceName"
    ],
    "properties": {
        "count": {
            "type": "integer",
            "default": 0,
            "title": "The count Schema",
            "examples": [
                12
            ]
        },
        "entries": {
            "type": "array",
            "default": [],
            "title": "The entries Schema",
            "items": {
                "type": "object",
                "default": {},
                "title": "A Schema",
                "required": [
                    "id",
                    "authorId",
                    "body",
                    "sequenceId",
                    "module",
                    "operation"
                ],
                "properties": {
                    "id": {
                        "type": "string",
                        "default": "",
                        "title": "The id Schema",
                        "examples": [
                            "4b7baf85-6248-4baa-9f2d-13aafa2be6e6"
                        ]
                    },
                    "authorId": {
                        "type": "string",
                        "default": "",
                        "title": "The authorId Schema",
                        "examples": [
                            "/posts/6e7b3fd8-cee7-46cb-a921-7b667dfd82d0"
                        ]
                    },
                    "body": {
                        "type": "string",
                        "default": "",
                        "title": "The body Schema",
                        "examples": [
                            "Only the good die young"
                        ]
                    },
                    "sequenceId": {
                        "type": "string",
                        "default": "",
                        "title": "The sequenceId Schema",
                        "examples": [
                            "-N7m4qR7BXYu0a3ku88s"
                        ]
                    },
                    "module": {
                        "type": "string",
                        "default": "",
                        "title": "The module Schema",
                        "examples": [
                            "postService"
                        ]
                    },
                    "operation": {
                        "type": "string",
                        "default": "",
                        "title": "The operation Schema",
                        "examples": [
                            "create"
                        ]
                    }
                },
                "examples": [{
                    "id": "4b7baf85-6248-4baa-9f2d-13aafa2be6e6",
                    "authorId": "/posts/6e7b3fd8-cee7-46cb-a921-7b667dfd82d0",
                    "body": "Only the good die young",
                    "sequenceId": "-N7m4qR7BXYu0a3ku88s",
                    "module": "postService",
                    "operation": "create"
                }]
            },
            "examples": [
                [{
                    "id": "4b7baf85-6248-4baa-9f2d-13aafa2be6e6",
                    "authorId": "/posts/6e7b3fd8-cee7-46cb-a921-7b667dfd82d0",
                    "body": "Only the good die young",
                    "sequenceId": "-N7m4qR7BXYu0a3ku88s",
                    "module": "postService",
                    "operation": "create"
                }]
            ]
        },
        "serviceName": {
            "type": "string",
            "default": "",
            "title": "The serviceName Schema",
            "examples": [
                "postService"
            ]
        }
    },
    "examples": [{
        "count": 12,
        "entries": [{
            "id": "4b7baf85-6248-4baa-9f2d-13aafa2be6e6",
            "authorId": "/posts/6e7b3fd8-cee7-46cb-a921-7b667dfd82d0",
            "body": "Only the good die young",
            "sequenceId": "-N7m4qR7BXYu0a3ku88s",
            "module": "postService",
            "operation": "create"
        }],
        "serviceName": "postService"
    }],
    "additionalProperties": "false"
}
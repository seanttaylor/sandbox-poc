export default {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The RecoveryStrategyRegistered Event Schema",
    "required": [
        "serviceName",
        "strategies"
    ],
    "properties": {
        "serviceName": {
            "type": "string",
            "default": "",
            "description": "The name of an application service registering a recovery strategy.",
            "title": "The serviceName Schema",
            "examples": [
                "postService"
            ]
        },
        "strategies": {
            "type": "array",
            "default": [],
            "description": "A list of recovery strategies for an application service",
            "title": "The strategies Schema",
            "items": {
                "type": "object",
                "default": {},
                "title": "A Schema",
                "required": [
                    "name",
                    "fn"
                ],
                "properties": {
                    "name": {
                        "type": "string",
                        "default": "",
                        "description": "The name of a recovery strategy for application service.",
                        "title": "The name Schema",
                        "examples": [
                            "resetRepository"
                        ]
                    },
                    "fn": {
                        "type": "object",
                        "default": {},
                        "description": "A function that executes the recovery of application experiencing errors.",
                        "title": "The fn Schema",
                        "required": [],
                        "properties": {},
                        "examples": [{}]
                    }
                },
                "examples": [{
                    "name": "resetRepository",
                    "fn": {}
                }]
            }
        }
    },
    "examples": [{
        "serviceName": "postService",
        "strategies": [{
            "name": "resetRepository",
            "fn": {}
        }]
    }],
    "additionalProperties": "false"
}
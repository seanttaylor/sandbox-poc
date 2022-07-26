export default {
    "$schema":"http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The GlobalErrorThresholdExeeded Event Schema",
    "required": [
        "errorCount",
        "code",
        "serviceName"
    ],
    "properties": {
        "errorCount": {
            "type": "integer",
            "description": "The total number of a given error type reported by an application service.",
            "title": "The errorCount Schema",
            "examples": [
                3
            ]
        },
        "code": {
            "type": "string",
            "default": "",
            "description": "A unique error code identifying a category of application errors.",
            "title": "The code Schema",
            "examples": [
                "service.error"
            ]
        },
        "serviceName": {
            "type": "string",
            "default": "",
            "description": "The name of the service associated with exceeding the error threshold.",
            "title": "The serviceName Schema",
            "examples": [
                "postService"
            ]
        }
    },
    "examples": [{
        "errorCount": 3,
        "code": "service.error",
        "serviceName": "postService"
    }]
}
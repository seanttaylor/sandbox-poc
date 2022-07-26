export default {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "Root Schema",
    "required": [
        "code",
        "message",
        "name",
        "module",
        "_open"
    ],
    "properties": {
        "code": {
            "type": "string",
            "default": "",
            "title": "The code Schema",
            "examples": [
                "service.error"
            ]
        },
        "message": {
            "type": "string",
            "default": "",
            "title": "The message Schema",
            "examples": [
                "The post could not be created"
            ]
        },
        "name": {
            "type": "string",
            "default": "",
            "title": "The name Schema",
            "examples": [
                "LibPostRouterError"
            ]
        },
        "module": {
            "type": "string",
            "default": "",
            "title": "The module Schema",
            "examples": [
                "/lib/plugins/router/post"
            ]
        },
        "_open": {
            "type": "object",
            "default": {},
            "title": "The _open Schema",
            "required": [],
            "properties": {},
            "examples": [{}]
        }
    },
    "examples": [{
        "code": "service.error",
        "message": "The post could not be created",
        "name": "LibPostRouterError",
        "module": "/lib/plugins/router/post",
        "_open": {}
    }]
}
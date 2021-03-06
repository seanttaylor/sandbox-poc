/* istanbul ignore file */
// Reason: Schemas are tested when their associated data types are tested.

export default {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The Application Error schema",
    "required": [
        "code",
        "message",
        "name",
        "module"
    ],
    "properties": {
        "code": {
            "$id": "#/properties/id",
            "type": "string",
            "default": "",
            "title": "An short identifier for a category of error emitted from a module",
            "examples": [
                "module.jainky"
            ]
        },
        "message": {
            "$id": "#/properties/message",
            "type": "string",
            "default": "",
            "title": "Text describing detailing the nature of an error",
            "examples": [
                "This is a jainky module, lol"
            ]
        },
        "name": {
            "$id": "#/properties/name",
            "type": "string",
            "default": "",
            "title": "String describing the general issue",
            "examples": [
                "LibJainkyModuleError",
                "CannotCreateRecord"
            ]
        },
        "module": {
            "$id": "#/properties/module",
            "type": "string",
            "default": "",
            "title": "The name of the module that emitted the error",
            "examples": [
                "/lib/jainky-module"
            ]
        },
        "_open": {
            "$id": "#/properties/_open",
            "type": "object",
            "default": "",
            "title": "An optional field to include supplemental unstructured data in an `ApplicationError`. Note: this field is unstable and may be removed at any time.",
            "examples": [
                {}
            ]
        }
    },
    "examples": [{
        "code": "module.jainky",
        "message": "This is a jainky module, lol",
        "name": "LibJainkyModuleError",
        "module": "/lib/jainky-module",
        "_open": {
            "stackTrace": "[STACK TRACE COULD BE HERE FOR EXAMPLE]"
        }
    }]
}
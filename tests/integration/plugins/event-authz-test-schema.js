/* istanbul ignore file */
export default {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "Root Schema",
    "required": [
        "foo",
        "qux"
    ],
    "properties": {
        "foo": {
            "type": "string",
            "default": "",
            "title": "The foo Schema",
            "examples": [
                "bar"
            ]
        },
        "qux": {
            "type": "integer",
            "default": 0,
            "title": "The qux Schema",
            "examples": [
                3
            ]
        }
    },
    "examples": [{
        "foo": "bar",
        "qux": 3
    }]
};

export default {
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "default": {},
    "title": "The ChaosExperimentRegistrationRequested Event Schema",
    "required": [
        "name",
        "start"
    ],
    "properties": {
        "name": {
            "type": "string",
            "default": "",
            "description": "The name of the chaos experiment being registered",
            "title": "The name Schema",
            "examples": [
                "unsetRepository"
            ]
        },
        "start": {
            "type": "object",
            "default": {},
            "description": "A function to bootstrap the chaos experiment",
            "title": "The start Schema",
            "required": [],
            "properties": {},
            "examples": [{}]
        }
    },
    "examples": [{
        "name": "unsetRepository",
        "start": {}
    }]
}
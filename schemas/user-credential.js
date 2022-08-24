/* istanbul ignore file */

export default {
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "http://example.com/user-credentials.json",
  "type": "object",
  "title": "The User Credential schema",
  "description": "The root schema comprises the entire JSON document.",
  "default": {},
  "examples": [
      {
          "id": "1735d84c-eada-4c71-80d7-c7c9056dfdc0",
          "userId": "e98417a8-d912-44e0-8d37-abe712ca840f",
          "password": "$2y$12$VMp52ykXPMUJoubKQ9H0ru9oGpkXR6Cxrq.s3ddh.si9zS4A6VekC",
          "emailAddress": "tstark@avengers.io",
          "createdAt": "2020-09-26T23:08:27.645Z",
          "lastModified": null
      }
  ],
  "required": [
      "id",
      "userId",
      "password",
      "emailAddress",
      "createdAt",
      "lastModified"
  ],
  "properties": {
      "id": {
          "$id": "#/properties/id",
          "type": "string",
          "title": "The id schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
              "1735d84c-eada-4c71-80d7-c7c9056dfdc0"
          ]
      },
      "userId": {
          "$id": "#/properties/userId",
          "type": "string",
          "title": "The userId schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
              "e98417a8-d912-44e0-8d37-abe712ca840f"
          ]
      },
      "password": {
          "$id": "#/properties/password",
          "type": "string",
          "title": "The password schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
              "$2y$12$VMp52ykXPMUJoubKQ9H0ru9oGpkXR6Cxrq.s3ddh.si9zS4A6VekC"
          ]
      },
      "emailAddress": {
          "$id": "#/properties/emailAddress",
          "type": "string",
          "title": "The emailAddress schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
              "tstark@avengers.io"
          ]
      },
      "createdAt": {
          "$id": "#/properties/createdAt",
          "type": "string",
          "title": "The createdAt schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
              "2020-09-26T23:08:27.645Z"
          ]
      },
      "lastModified": {
          "$id": "#/properties/lastModified",
          "type": ["string", "null"],
          "title": "The lastModified schema",
          "description": "An explanation about the purpose of this instance.",
          "default": null,
          "examples": [
              null
          ]
      }
  },
  "additionalProperties": false
}
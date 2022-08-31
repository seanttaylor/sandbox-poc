/* istanbul ignore file */

export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://schemas.parcely.com/user",
  "type": "object",
  "title": "The User schema",
  "description": "The root schema comprises the entire JSON document.",
  "default": {},
  "examples": [
    {
      "id": "fee7b553-f3d1-4a6f-82ae-7e37e1ed697c",
      "firstName": "Nick",
      "lastName": "Fury",
      "handle": "@nfury",
      "motto": "Always bet on black",
      "emailAddress": "nfury@shield.gov",
      "password": "superSecretPassword",
      "createdAt": "2021-02-24T17:45:36.230152",
      "lastModified": "2021-01-24T17:45:36.230152",
      "isVerified": false
    }
  ],
  "required": [
      "id",
      "firstName",
      "lastName",
      "handle",
      "motto",
      "emailAddress",
      "createdAt",
      "password",
      "lastModified",
      "isVerified"
  ],
  "properties": {
      "id": {
        "$id": "#/properties/id",
        "type": "string",
        "title": "The id schema",
        "description": "The user uuid.",
        "default": "",
        "examples": [
          "fee7b553-f3d1-4a6f-82ae-7e37e1ed697c"
        ]
      },
      "firstName": {
        "$id": "#/properties/firstName",
        "type": "string",
        "title": "The firstName schema",
        "description": "The user first name.",
        "default": "",
        "examples": [
            "Nick"
        ]
      },
      "lastName": {
          "$id": "#/properties/lastName",
          "type": "string",
          "title": "The lastName schema",
          "description": "The user last name.",
          "default": "",
          "examples": [
              "Fury"
          ]
      },
      "handle": {
          "$id": "#/properties/handle",
          "type": "string",
          "title": "The handle schema",
          "description": "The user handle",
          "default": "",
          "examples": [
            "@ironman"
          ]
      },
      "motto": {
        "$id": "#/properties/motto",
        "type": "string",
        "title": "The motto schema",
        "description": "The user motto",
        "default": "",
        "examples": [
          "@ironman"
        ]
      },
      "emailAddress": {
          "$id": "#/properties/emailAddress",
          "type": "string",
          "title": "The emailAddress schema",
          "description": "The user email address.",
          "default": "",
          "examples": [
              "nfury@shield.gov"
          ]
      },
      "password": {
          "$id": "#/properties/password",
          "type": "string",
          "title": "The password schema",
          "description": "The hashed user password.",
          "default": "",
          "examples": [
              "superSecretPassword"
          ]
      },
      "createdAt": {
          "$id": "#/properties/createdAt",
          "type": "string",
          "title": "The createdAt schema",
          "description": "The date a specified User entity was created.",
          "default": "",
          "examples": [
              "2021-02-24T17:45:36.230152"
          ]
      },
      "lastModified": {
          "$id": "#/properties/lastModified",
          "type": ["string", "null"],
          "title": "The lastModified schema",
          "description": "The date a specified User entity was last modified.",
          "default": "",
          "examples": [
              "2021-01-24T17:45:36.230152"
          ]
      },
      "isVerified": {
          "$id": "#/properties/isVerified",
          "type": "boolean",
          "title": "The isVerified schema",
          "description": "An explanation about the purpose of this instance.",
          "default": false,
          "examples": [
              false
          ]
      }
  },
  //"additionalProperties": false
}
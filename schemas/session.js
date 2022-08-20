/* istanbul ignore file */

export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/example.json",
  "type": "object",
  "default": {},
  "title": "Root Schema",
  "required": [
    "id",
    "userId",
    "token",
    "expiryDate",
    "createdAtTimestamp",
  ],
  "properties": {
      "id": {
        "type": "string",
        "default": "",
        "title": "The id Schema",
        "description": "The guid of the session",
        "examples": [
           "/sessions/3af888b9-a65a-4d00-8cd0-ddd8901bfe8a"
        ]
      },
      "userId": {
        "type": "string",
        "default": "",
        "title": "The userId Schema",
        "description": "The uuid of the user associated with the session",
        "examples": [
            "/users/5f4301aa-8e09-4e11-b72c-56c398e30230"
        ]
      },
      "token": {
        "type": "string",
        "default": "",
        "title": "The token Schema",
        "description": "The authentication token associated with the session",
        "examples": [
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        ]
      },
      "expiryDate": {
        "type": "number",
        "default": "",
        "title": "The expiryDate Schema",
        "description": "The date the authorization (and by extension the session) expires",
        "examples": [
          1660956483126
        ]
      },
      "isExpired": {
        "type": "boolean",
        "default": "",
        "title": "The expired Schema",
        "description": "Indicates whether a session is expired",
        "examples": [
          "true"
        ]
      },
      "createdAtTimestamp": {
        "type": "string",
        "default": "",
        "title": "The createdAtTimestamp Schema",
        "description": "The date/time the session was created",
        "examples": [
          "2022-08-19T21:41:37.646Z"
        ]
      },
      "lastModifiedTimestamp": {
        "type": "string",
        "default": "",
        "description": "The guid of the session",
        "title": "The lastModifiedTimestamp Schema",
        "examples": [
          "2022-08-19T21:41:37.646Z"
        ]
      }
  },
  "examples": [{
      "id": "/sessions/3af888b9-a65a-4d00-8cd0-ddd8901bfe8a",
      "userId": "/users/5f4301aa-8e09-4e11-b72c-56c398e30230",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      "expiryDate": 1660956483126,
      "createdAt": "2022-08-19T21:41:37.646Z",
      "lastModified": "2022-08-19T21:41:37.646Z"
  }],
  "additionalProperties": false
}
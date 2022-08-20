/* istanbul ignore file */
// Reason: This file only exports mock data for the in-memory document store immplementation

export default {
   "__comments": "Sample data store with some valid seed data.",
    "users": {
        "1d2b3f93-804b-4e02-94ad-2eec6b90997d": {
            "id": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
            "handle": "@ironman",
            "firstName": "Tony", 
            "lastName": "Stark", 
            "email": "tstark@avengers.io", 
            "profileImageURL": "https://via.placeholder.com/150", 
            "schemaVersion": "0.0.1", 
            "schemaURL": "/schemas/user/0.0.1/user.json",
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z" 
        },
        "2294a21b-ba63-4e5e-b537-d61ba40e4a65": {
            "id": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
            "handle": "@spidey",
            "firstName": "Peter", 
            "lastName": "Parker", 
            "email": "pparker@avengers.io", 
            "profileImageURL": "https://via.placeholder.com/150", 
            "schemaVersion": "0.0.1",
            "schemaURL": "/schemas/user/0.0.1/user.json",
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
        },
        "2a1acb10-8d2b-4248-a74e-a8418f941dd9": {
            "id": "/users/2a1acb10-8d2b-4248-a74e-a8418f941dd9",
            "handle": "@captainUSA",
            "firstName": "Steve", 
            "lastName": "Rogers", 
            "email": "srogers@avengers.io", 
            "profileImageURL": "https://via.placeholder.com/150", 
            "schemaVersion": "0.0.1",
            "schemaURL": "/schemas/user/0.0.1/user.json",
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
        },
        "f50ef714-5a51-4a0b-a3e5-99529ba41fce": {
            "id": "/users/f50ef714-5a51-4a0b-a3e5-99529ba41fce",
            "handle": "@blackwidow",
            "firstName": "Natasha", 
            "lastName": "Romanoff", 
            "email": "nromanoff@avengers.io", 
            "profileImageURL": "https://via.placeholder.com/150", 
            "schemaVersion": "0.0.1",
            "schemaURL": "/schemas/user/0.0.1/user.json",
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
        },
        "b20cdf59-b121-4b00-9e43-d2c48e2cf98f": {
            "id": "/users/b20cdf59-b121-4b00-9e43-d2c48e2cf98f",
            "handle": "@hulk",
            "firstName": "Bruce", 
            "lastName": "Banner", 
            "email": "bbanner@avengers.io", 
            "profileImageURL": "https://via.placeholder.com/150", 
            "schemaVersion": "0.0.1", 
            "schemaURL": "/schemas/user/0.0.1/user.json",
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
        }
    },
    "posts": {
        "/posts/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09": {
            "id": "/posts/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09",
            "authorId": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
            "authorHandle": "@ironman",
            "authorDisplayName": "Tony Stark",
            "schemaVersion": "0.0.1", 
            "schemaURL": "/schemas/post/0.0.1/post.json", 
            "body": "Hello world! Playboy Billionaire Genius here...",
            "comments": ["/comments/eda2b86b-0e38-4c83-b294-36c3d302127a"],
            "likes": [],
            "lastModifiedTimestamp": null,
            "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
        }
    },
    "sessions": {
      /*"/sessions/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09": {
        "id": "/sessions/2244428a-a945-4d4c-bf4d-a9d8ca6cbf09",
        "userId": "/users/1d2b3f93-804b-4e02-94ad-2eec6b90997d",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "expiryDate": "2022-06-26T14:24:04.904Z", 
        "isExpired": false,
        "lastModifiedTimestamp": null,
        "createdAtTimestamp": "2022-06-26T14:24:04.904Z"  
      }*/
  }
}
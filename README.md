# Search events service

This is a REST API for event notifications. This app created to help people quickly find interesting activities depending on the location (person or selected manually). With this service you are always updated with the latest events for every taste.

## Getting started

To get you started you can simply clone this repository and install the dependencies:

Clone the notification-event-service repository using git:

```
git clone https://github.com/melyourhero/goevent-api
cd goevent-api
```

### Install dependencies

**The entire project**

```
npm install
```

**You need also run a Redis server for caching data:**

```
cd [path-to-redis]
src/redis-server
```

[For more information how to install and configure Redis](http://redis.io/topics/quickstart)

### Run the application

**In the root folder type:**

```
npm start 
```

Note: if you are using windows, you should run the server with the following commands in the console:

```
set NODE_PATH=.
set NODE_ENV=development
nodemon server
```

Now try to do ajax request to the app at `http://localhost:8000/v1.0/`

Note: if you want start test, you should change NODE_ENV:

```
set NODE_PATH=.
set NODE_ENV=test
npm test
```

#API specification:

* ##URL
 
  events

* ###Method:
  
  `GET`
  
* ###URL Params

  Not-required:

  `offset=[integer]`
  
  `limit=[integer]`
  
  `fields=[string]`

* ###Data Params

  None

* ###Success Response:

  Code: 200 
  
  Content: 
  ```
    {
      eventId: "1111XXXXXXXXXXX",
      eventName: "Name of event",
      eventDescription: "Description oabout event",
      eventPicture: "Event picture URL",
      eventStartTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventEndTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventCategory: "Music",
      eventLocation: {
        location: {
          city: "Event city",
          country: "Event country",
          latitude: 50.45,
          longitude: 10.33,
        }
      }
    }
```

* ###Error Response:

  Code: 
  - 400 Bad Request - when user passed invalid parameters
  - 500 Internal Server Error - when server have problem with request to database with/without parameters
  - 500 Internal Server Error - when server have problem with caching data to memory
  - 502 Bad Gateway - when server have problem with getting data from redis
   
* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/events",
    type : "GET",
    success : function(events) {
      console.log(events);
    }
  });
  ```
  
* ##URL
 
  events/:id

* ###Method:
  
  `GET`
  
* ###Identificator 

  Required:

  `id=[integer]`

* ###Data Params

  None

* ###Success Response:

  Code: 200 
  
  Content: 
  ```
    {
      eventId: "1111XXXXXXXXXXX",
      eventName: "Name of event",
      eventDescription: "Description oabout event",
      eventPicture: "Event picture URL",
      eventStartTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventEndTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventCategory: "Music",
      eventLocation: {
        location: {
          city: "Event city",
          country: "Event country",
          latitude: 50.45,
          longitude: 10.33,
        }
      }
    }
```

* ###Error Response:

  Code: 
  - 400 Bad Request - when user passed invalid parameters
  - 404 Not Found - when client tries to get non existing event
  - 500 Internal Server Error - when server have problem with request to database
  - 502 Bad Gateway - when server have problem with getting data from redis
  
* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/events/2143546423430321",
    type : "GET",
    success : function(singleEvent) {
      console.log(singleEvent);
    }
  });
  ```
  
* ##URL
 
  events-location

* ###Method:
  
  `GET`
  
* ###URL Params

  Required:

  `latitude=[integer]`
  
  `longitude=[integer]`
  
  Non-required:
  
  `distance=[integer]`
  
  Note: by default 2500 meters 

* ###Data Params

  None

* ###Success Response:

  Code: 200 
  
  Content: 
  ```
    {
      eventId: "1111XXXXXXXXXXX",
      eventName: "Name of event",
      eventDescription: "Description oabout event",
      eventPicture: "Event picture URL",
      eventStartTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventEndTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventCategory: "Music",
      eventLocation: {
        location: {
          city: "Event city",
          country: "Event country",
          latitude: 50.45,
          longitude: 10.33,
        }
      }
    }
```

* ###Error Response:

  Code: 
  - 400 Bad Request - when user passed invalid parameters
  - 502 Bad Gateway - when server received invalid response from the upstream server

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/events-location?lat=50.43&lng=30.52&distance=4000",
    type : "GET",
    success : function(locationEvents) {
      console.log(locationEvents);
    }
  });
  ```
  
* ##URL
 
  user/login

* ###Method:
  
  `POST`
  
* ###URL Params

  None

* ###Data Params

  Required:

 `username=[string]`
 
 `password=[string]`

* ###Success Response:

  Code: 200   

* ###Error Response:

  Code: 
  - 404 Not Found - when user wasn't found by passed data

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/user/login",
    type : "POST",
    body: {
        username: "Leonhard Euler",
        password: "lovemathematics123"
    },
    success : function(session) {
      console.log(session);
    }
  });
  ```  

* ##URL
 
  user/logout

* ###Method:
  
  `POST`
  
* ###URL Params

  None

* ###Data Params

  None

* ###Success Response:

  Code: 200   

* ###Error Response:

  Code: 
  - 404 Not Found - when session expired and deleted from database

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/user/logout",
    type : "POST",
    success : function(destroyed) {
      console.log(destroyed);
    }
  });
  ``` 
     
* ##URL
 
  user/events

* ###Method:
  
  `GET`
  
* ###URL Params

  None

* ###Data Params

  None

* ###Success Response:

  Code: 200 
  
  Content: 
  ```
    {
      eventCreator: "user_session_id"
      eventId: "1111XXXXXXXXXXX",
      eventName: "Name of event",
      eventDescription: "Description oabout event",
      eventPicture: "Event picture URL",
      eventStartTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventEndTime: "20XX-XX-XXTXX:XX:XX+XXXX",
      eventCategory: "Music",
      eventLocation: {
        location: {
          city: "Event city",
          country: "Event country",
          latitude: 50.45,
          longitude: 10.33,
        }
      }
    }
```

* ###Error Response:

  Code:
  - 401 Unauthorized - when server has'n found the session and the user isn't logged in
  - 404 Not found - when server didn't find any events for unique user  

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "http://localhost:8000/v1.0/user/events",
    type : "GET",
    success : function(userEvents) {
      console.log(userEvents);
    }
  });
  ```
  
* ##URL
 
  user/events/:id

* ###Method:
  
  `POST`
  
* ###Identificator

  Required:

  `id=[integer]`
 
* ###Data Params
  
  None
  
* ###Success Response:

  Code: 200 
  
* ###Error Response:

  Code: 
  - 401 Unauthorized - when server has'n found the session and the user isn't logged in
  - 404 Not Found - event was not found at the specified id
  - 500 Internal Server Error - when server have error with saving event to database
  
* ###Sample Call:
 
    ```javascript
    $.ajax({
      url: "http://localhost:8000/v1.0/user/events/111111111111",
      type : "POST",
      success : function(response) {
        console.log(response);
      }
    });
    ```

* ##URL
 
  user/events/:id

* ###Method:
  
  `DELETE`
  
* ###Identificator

  Required:

  `id=[integer]`
 
* ###Data Params
  
  None
  
* ###Success Response:

  Code: 200 
  
* ###Error Response:

  Code: 
  - 401 Unauthorized - when server has'n found the session and the user isn't logged in
  - 404 Not Found - event was not found at the specified id
  - 500 Internal Server Error - when server have error with saving event to database
  
* ###Sample Call:
 
    ```javascript
    $.ajax({
      url: "http://localhost:8000/v1.0/user/events/111111111111",
      type : "DELETE",
      success : function(response) {
        console.log(response);
      }
    });
    ```





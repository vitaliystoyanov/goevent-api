# Search events service

This is a REST API for event notifications. This app created to help people quickly find interesting activities depending on the location (person or selected manually). With this service you are always updated with the latest events for every taste.

## Getting Started

To get you started you can simply clone this repository and install the dependencies:

Clone the notification-event-service repository using git:

```
git clone https://github.com/melyourhero/goevent-api
cd goevent-api
```

### Install Dependencies

**The entire project**

```
npm install
```

**You need also run a Redis server for caching data:**

```
cd [path-to-redis]
src/redis-server
```

[For more information how to install and configure](http://redis.io/topics/quickstart)

### Run the Application

**In the root folder type:**

```
npm start 
```

Now try to do ajax request to the app at `http://localhost:8000/`

#API Specs:

* ##URL
 
  /v1/events/

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

  Code: 404 Not found  

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "/v1.0/events",
    type : "GET",
    success : function(events) {
      console.log(events);
    }
  });
  ```
  
* ##URL
 
  /v1/events/:id

* ###Method:
  
  `GET`
  
* ###URL Params

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

  Code: 404 Not found 

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "/v1.0/events/2143546423430321",
    type : "GET",
    success : function(singleEvent) {
      console.log(singleEvent);
    }
  });
  ```
  
* ##URL
 
  /v1/events-location/

* ###Method:
  
  `GET`
  
* ###URL Params

  Required:

  `latitude=[integer]`
  
  `longitude=[integer]`
  
  Non-required:
  
  `distance=[integer]`

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

  Code: 404 Not found 

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "/v1.0/events-location?lat=50.43&lng=30.52&distance=4000",
    type : "GET",
    success : function(locationEvents) {
      console.log(locationEvents);
    }
  });
  ```
  
* ##URL
 
  /v1/user/user-events

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

  Code: 404 Not found 

* ###Sample Call:

  ```javascript
  $.ajax({
    url: "/v1.0/user/user-events",
    type : "GET",
    success : function(userEvents) {
      console.log(userEvents);
    }
  });
  ```
  
* ##URL
 
  /v1/user/new-event

* ###Method:
  
  `POST`
  
* ###URL Params

  None

* ###Data Params
  
  event=[Object]
  

* ###Success Response:

  Code: 200 
  

* ###Error Response:

  Code: 500 Internal error






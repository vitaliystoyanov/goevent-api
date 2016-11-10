const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let eventSchema = new Schema({
    eventCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eventId: String,
    eventName: String,
    eventDescription: String,
    eventCategory: String,
    eventPicture: String,
    eventStartTime: String,
    eventEndTime: String,
    eventLocation: {
        placeId: String,
        placeName: String,
        location: {
            country: String,
            city: String,
            street: String,
            latitude: Number,
            longitude: Number
        }
    }
});

let Event = mongoose.model('Event', eventSchema);
let UserEvent = mongoose.model('UserEvent', eventSchema);

module.exports = {
    Event,
    UserEvent
};



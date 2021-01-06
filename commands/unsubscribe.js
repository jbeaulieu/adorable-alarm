const db = require("../db");

module.exports = {
    name: '!unsubscribe',
    description: 'Unsubscribe user from alarm feed',
    execute(msg, args) {
        const unsubscriber = msg.author

        const db = require('../db');

        // Look up the user's id based on their discord identity
        db.userExists(unsubscriber.id).then(function(user_id) {

            if(user_id == -1) {
                // User isn't currently subscribed, alert them and do nothing else
                msg.channel.send(`<@${unsubscriber.id}>, you are not subscribed to AdorableAlarms`);
            } else {
                // User is subscribed, let's remove them
                db.deleteAllAlarms(user_id);    // Delete all alarms connected to the user_id
                db.deleteUser(user_id);         // Delete the user from the master user table
                msg.channel.send(`Unsubscribed <@${unsubscriber.id}>. We're sad to see you go!`);
            }
        })
        .catch(function(err) { console.log(err) });
    },
  };
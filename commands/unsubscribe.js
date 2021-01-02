const db = require("../db");

module.exports = {
    name: '!unsubscribe',
    description: 'Unsubscribe user from alarm feed',
    execute(msg, args) {
        const unsubscriber = msg.author
        console.info(unsubscriber)

        const db = require('../db');

        // Look up the user's id based on their discord identity
        db.userExists(unsubscriber.id).then(function(user_id) {

            if(user_id == -1) {
                // User isn't currently subscribed, alert them and do nothing else
                msg.channel.send(`<@${unsubscriber.id}>, you are not subscribed to AdorableAlarms`);
            } else {
                // Delete all alarms connected to the user_id
                db.deleteAlarm(user_id);
                // Finally, delete the user from the master user table
                db.deleteUser(user_id);

                msg.channel.send(`Unsubscribed <@${unsubscriber.id}> from all alarms`);
            }
        })
        .catch(function(err) { console.log(err) });
    },
  };
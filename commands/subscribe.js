module.exports = {
    name: '!subscribe',
    description: 'Subscribe user to alarm feed',
    execute(msg, args) {

        const db = require('../db');
        const newSubscriber = msg.author;

        // Query user table to see if this user is already subscribed
        db.userExists(newSubscriber.id)
        .then(function(user_id) {
            if (user_id==-1) {
                // User does not already exist, so let's create a new user before setting up their alarm
                db.createUser(newSubscriber.id)
                .then(function(new_user_id) {
                    user_id = new_user_id;
                    db.createAlarm(user_id);
                });
            } else {
                // User already exists, create an alarm tied to their user_id
                db.createAlarm(user_id);
            }
        })
        .catch(function(err) { console.log(err) });

        msg.channel.send(`Subscribed <@${newSubscriber.id}> to Adorable Alarms!`);
    },
  };
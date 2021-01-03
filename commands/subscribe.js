module.exports = {
    name: '!subscribe',
    description: 'Subscribe user to alarm feed',
    execute(msg, args) {

        const db = require('../db');
        const newSubscriber = msg.author;
        const time = db.parsetime(args[0])

        // Query user table to see if this user is already subscribed
        db.userExists(newSubscriber.id)
        .then(function(user_id) {
            if (user_id==-1) {
                // User does not already exist, so let's create a new user before setting up their alarm
                db.createUser(newSubscriber.id)
                .then(function(new_user_id) {
                    user_id = new_user_id;
                    if(time != -1) {
                        db.createAlarm(user_id, time);
                        msg.channel.send(`Subscribed <@${newSubscriber.id}> to Adorable Alarms at ${time}!`);
                    } else {
                        msg.send(`<@${newSubscriber.id}>, I couldn't read a valid time to subscribe you to. Please try again`);
                    }
                });
            } else {
                // User already exists, create an alarm tied to their user_id
                if(time != -1) {
                    db.createAlarm(user_id, time);
                    msg.channel.send(`<@${newSubscriber.id}>, you've added ${time} to your alarms!`);
                } else {
                    msg.send(`<@${newSubscriber.id}>, I couldn't read a valid time to add to your subscription. Please try again`);
                }
            }
        })
        .catch(function(err) { console.log(err) });

    },
  };
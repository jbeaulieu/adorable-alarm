module.exports = {
    name: '!removealarm',
    description: "Remove an alarm from a user's subscribtion",
    execute(msg, args) {

        const db = require('../db');
        const discord_id = msg.author.id;
        const time = db.parsetime(args[0]);

        db.userExists(discord_id).then(function(user_id) {

            if(user_id == -1) {
                // User does not exist
                msg.channel.send(`<@${discord_id}>, it doesn't seem like you're currently signed up for AdorableAlarms`);
            } else {
                if(time == -1) {
                    // An invalid alarm time was submitted, prompt the user to try again
                    msg.channel.send(`<@${discord_id}>, I couldn't read a valid time to subscribe you to. Please try again`);
                } else {
                    // Create new alarm at the specified time, assigned to the user
                    db.deleteAlarm(user_id, time)
                    msg.channel.send(`Removed the ${time} alarm from <@${discord_id}>'s subscription`);
                }       
            }
        });
    }
};
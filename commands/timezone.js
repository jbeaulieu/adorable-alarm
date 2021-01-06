module.exports = {
    name: '!timezone',
    description: "Set a user's timezone",
    execute(msg, args) {

        const db = require('../db');
        const discord_id = msg.author.id;

        //Check if user supplied an argument to try parsing
        if(args[0] != null) {

            var timezone = db.parseTimezone(args[0].toUpperCase());

            if(timezone != -1) {
                // We managed to parse a successful timezone from the user's message.
                // Next, check if they're already a registered user, and get their userID if so
                db.userExists(discord_id).then(function(user_id) {

                    if(user_id != -1) {
                        // We located their userID. Update the user's profile info with the new timezone
                        db.setTimezone(user_id, timezone)
                        msg.channel.send(`Updated <@${discord_id}>'s timezone to ${args[0].toUpperCase()}`)
                    } else {
                        // User does not exist
                        msg.channel.send(`<@${discord_id}>, it doesn't seem like you're currently signed up for AdorableAlarms`);
                    }
                });

            } else {
                // An argument was provided, but it couldn't be parsed to match a valid timezone
                msg.channel.send(`<@${discord_id}>, I couldn't read that timezone. To view a list of available `
                    + `timezones, use the \`!listTimezones\` command`)
            }
            
        } else {
            // User did not provide a timezone argument. Give them a general info message about the command
            msg.channel.send(`Use this command to set or update your timezone, which will be used to schedule your alarms. `
            + `To see a list of available timezones, use the \`!listTimezones\` command`)
        }


    }
};
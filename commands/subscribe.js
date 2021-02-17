module.exports = {
    name: '!subscribe',
    description: 'Subscribe user to alarm feed',
    execute(msg, args) {

        const db = require('../db');
        const newSubscriber = msg.author;

        // Query user table to see if this user is already subscribed
        db.userExists(newSubscriber.id)
        .then(user_id => {
            if(user_id == -1) {
                // User does not already exist, so let's create a new user before setting up their alarm

                //Check if user supplied a valid timezone as an argument
                if(args[0] != null) {
                    var timezone = db.parseTimezone(args[0].toUpperCase());
                    
                    if(timezone != -1) {
                        // A valid timezone was provided. Create a new user entry with that timezone assigned
                        db.createUser(newSubscriber.id, timezone)
                        msg.channel.send(`Congratulations <@${newSubscriber.id}>, you're signed up! You can now add alarms`)
                    } else {
                        // An argument was provided, but it couldn't be parsed to match a valid timezone
                        db.createUser(newSubscriber.id, '')
                        msg.channel.send(`<@${newSubscriber.id}>, I couldn't read that timezone. You can try entering it again `
                        + `here, or use the \`!timezone\` command`).then(() => {
                            
                            // Create a filter and listener for only messages coming from this same discord user
                            const filter = m => msg.author.id === m.author.id;
                            msg.channel.awaitMessages(filter, {time: 60000, max: 1, errors: ['time'] })
                            .then(messages => {

                                // Get the next message sent by that user, and try parsing it to a timezone
                                var response = messages.first().content;
                                timezone = db.parseTimezone(response.toUpperCase());
                                if(timezone != -1) {
                                    // User supplied a valid timezone this time
                                    msg.channel.send(`Congratulations <@${newSubscriber.id}>, you're signed up! You can now add alarms`);
                                    db.createUser(newSubscriber.id, timezone);
                                } else {
                                    // Still couldn't successfully parse a timezone. Tell the user to try again using the command
                                    msg.channel.send(`I still couldn't parse that. Please set your timezone using the \`!timezone\``
                                    + `command`);
                                    db.createUser(newSubscriber.id, '');
                                }
                            })
                            .catch(() => {
                                msg.channel.send(`Sorry <@${newSubscriber.id}>, I couldn't find a response. Please set your `
                                + `timezone using the \`!timezone\` command`);
                            });
                        });
                    }
                } else {
                    // User did not provide a timezone argument. Create a new user, but alert them that one is needed
                    db.createUser(newSubscriber.id, '');
                    msg.channel.send(`Welcome, <@${newSubscriber.id}>! Before you can create alarms, you'll need to set your `
                        + `timezone using the \`!timezone\` command. Otherwise, your alarm times will default to UTC. Thanks!`)
                }

            } else {
                // User already exists
                msg.channel.send(`<@${newSubscriber.id}>, you're already subscribed!`)
            }
        })
        .catch(function(err) { console.log(err) });

        // msg.author.send("Hi there! Welcome to Adorable Alarms!")
    },
  };
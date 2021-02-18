const db = require("../db");

module.exports = {
    name: '!addchannel',
    description: 'Add a discord channel to the list of daily subscribers',
    execute(msg, args) {

        const user_id = msg.author.id;

        // Check that the user trying to subscribe the channel has channel management permissions.
        // We do this as a basic precaution against random server members making changes to the bot config
        if(msg.member.hasPermission('MANAGE_CHANNELS')) {
            const channel_id = msg.channel.id;
            db.addChannel(channel_id).then(function(result) {
                if(result == -1)
                {
                    msg.channel.send(`Seems like I'm already set up here! Thanks for thinking of me though! :heart:`)
                } else {
                    msg.channel.send(`We're on it! You'll have daily posts of adorableness coming to this channel soon!`);
                }
            });
        } else {
            // The user requesting the channel to be added doesn't have permissions
        msg.channel.send(`Sorry <@${user_id}>, you need \`MANAGE_CHANNEL\` permissions to manage the bot!`);
      }
    },
  };
const db = require("../db");

module.exports = {
    name: '!removechannel',
    description: 'Remove a discord channel from the list of daily subscribers',
    execute(msg, args) {
        
        const user_id = msg.author.id;

        // Check that the user trying to subscribe the channel has channel management permissions.
        // We do this as a basic precaution against random server members making changes to the bot config
        if(msg.member.hasPermission('MANAGE_CHANNELS')) {
            const channel_id = msg.channel.id;
            db.deleteChannel(channel_id).then(function(result) {
                if(result == -1)
                {
                    // Channel was not signed up, or has already been deleted
                    msg.channel.send(`Hm, looks like I was never added to this channel`);
                } else {
                    msg.channel.send(`We're packing things up and won't post here anymore. See you later!`);
                }
            });
        } else {
            // The user requesting the channel to be added doesn't have permissions
        msg.channel.send(`Sorry <@${user_id}>, you need \`MANAGE_CHANNEL\` permissions to manage the bot!`);
      }
    },
  };
module.exports = {
    name: '!subscribe',
    description: 'Subscribe user to alarm feed',
    execute(msg, args) {
        const newSubscriber = msg.author;
        console.info(newSubscriber)
        msg.channel.send(`Subscribed <@${newSubscriber.id}> to Adorable Alarms!`);
    },
  };
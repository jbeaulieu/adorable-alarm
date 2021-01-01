module.exports = {
    name: '!unsubscribe',
    description: 'Unsubscribe user from alarm feed',
    execute(msg, args) {
        const newSubscriber = msg.author
        console.info(newSubscriber)
        msg.channel.send(`Unsubscribed <@${newSubscriber.id}> from all alarms`);
    },
  };
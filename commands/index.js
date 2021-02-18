const unsubscribe = require('./unsubscribe');

module.exports = {
    Ping: require('./ping'),
    Subscribe: require('./subscribe'),
    Unsubscribe: require('./unsubscribe'),
    AddAlarm: require('./addAlarm'),
    RemoveAlarm: require('./removeAlarm'),
    Timezone: require('./timezone'),
    AddChannel: require('./addChannel'),
    RemoveChannel: require('./removeChannel')
  };
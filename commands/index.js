const unsubscribe = require('./unsubscribe');

module.exports = {
    Ping: require('./ping'),
    Subscribe: require('./subscribe'),
    Unsubscribe: require('./unsubscribe'),
    AddAlarm: require('./addAlarm'),
    RemoveAlarm: require('./removeAlarm')
  };
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false
    }
});

const timezoneMap = {
    'EST': '-05',
    'CST': '-06',
    'MST': '-07',
    'PST': '-08',
    'AKST': '-09',
    'HST': '-10',
};

var createUser = function(discord_id, timezone) {

    return new Promise(function (resolve, reject) {
        pool.query(`INSERT INTO users VALUES (DEFAULT, 1, now()::timestamp, '${discord_id}', '${timezone}')`, function(err, result) {
            if (err) {
                return reject(err);
            }
        });

        pool.query(`SELECT id FROM users WHERE discord_id = '${discord_id}'`, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                if (result.rowCount > 0) {
                    return resolve(result.rows[0].id);
                }
            }
            return resolve(-1);
        });
    });
};

var deleteUser = function(user_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`DELETE FROM users WHERE id = '${user_id}'`, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
}

var userExists = function(discord_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`SELECT * FROM users WHERE discord_id = '${discord_id}'`, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                if (result.rowCount > 0) {
                    return resolve(result.rows[0].id);
                }
            }
            return resolve(-1);
        });
    });
};

var addChannel = function(channel_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`SELECT FROM channels WHERE channel_id = '${channel_id}'`, function(err, result) {
            if(err) {
                return reject(err)
            } else if(result.rowCount > 0) {
                // Channel is already signed up
                return resolve(-1);
            } else {
                pool.query(`INSERT INTO channels VALUES (DEFAULT, '${channel_id}', now()::timestamp)`, function(err, result) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }
        });
    });
};

var deleteChannel = function(channel_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`SELECT FROM channels WHERE channel_id = '${channel_id}'`, function(err, result) {
            if(err) {
                return reject(err)
            } else if(result.rowCount == 0) {
                // Channel does not exist in database
                return resolve(-1);
            } else {
                pool.query(`DELETE FROM channels WHERE channel_id = '${channel_id}'`, function(err, result) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve();
                });
            }
        });
    });
}

var createAlarm = function(user_id, time) {

    return new Promise(function (resolve, reject) {

        pool.query(`SELECT timezone from users WHERE id=${user_id}`, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                let timezone = result.rows[0].timezone;

                pool.query(`SELECT timezone('UTC', time with time zone '${time}${timezone}')`, function (err, result) {
                    if (err) {
                        return reject(err);
                    } else {
                        let alarmUTC = result.rows[0].timezone;
                        pool.query(`INSERT INTO alarms VALUES (DEFAULT, '${user_id}', TO_TIMESTAMP('${alarmUTC}', 'HH24:MI:SS')::TIME, now()::timestamp)`, function(err, result) {
                            if (err) {
                                return reject(err);
                            } else {
                                if (result.rowCount > 0) {
                                    return resolve(result.rows);
                                }
                            }
                            return resolve(false);
                        });
                    }
                });
            }
        });
    });
};

var deleteAlarm = function(user_id, time) {

    return new Promise(function (resolve, reject) {

        pool.query(`SELECT timezone from users WHERE id=${user_id}`, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                let timezone = result.rows[0].timezone;

                pool.query(`SELECT timezone('UTC', time with time zone '${time}${timezone}')`, function (err, result) {
                    if (err) {
                        return reject(err);
                    } else {
                        let timeUTC = result.rows[0].timezone;
                        pool.query(`DELETE FROM alarms WHERE user_id = '${user_id}' AND alarm = '${timeUTC}'`, function(err, result) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(true);
                        });
                    }
                });
            }
        });
    });
}

var deleteAllAlarms = function(user_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`DELETE FROM alarms WHERE user_id = '${user_id}'`, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
}

var parsetime = function (text) {

    var PM = 0;

    if(text.slice(-2) == "am" || text.slice(-2) == "pm") {
        if (text.slice(-2) == "pm") {
            PM = 12;
        }
        text = text.slice(0, -2);
    }

    var time = text.split(':');
    var hour = parseInt(time[0]);
    var minute = parseInt(time[1]);

    if(isNaN(hour) || isNaN(minute)) {
        return -1
    } else {

        if(0 <= hour && hour <= 23 && 0 <= minute && minute <= 59) {

            return ((hour + PM) % 24) + ':' + (Math.floor(minute / 15) * 15)
        }
        return -1
    }
}

var parseTimezone = function(text) {
    
    if(timezoneMap[text] != null)
    {
        return timezoneMap[text];
    } else {
        return -1;
    }
}

var setTimezone = function(user_id, timezone) {

    return new Promise(function (resolve, reject) {
        pool.query(`UPDATE users SET timezone = '${timezone}' WHERE id=${user_id};`, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(true);
        });
    });
}

var getTimezone = function(user_id) {

}

var getAlarmsAtTime = function(time) {

    return new Promise(function (resolve, reject) {
        pool.query(`SELECT alarms.id, alarms.alarm, users.id, users.discord_id FROM alarms INNER JOIN users ON alarms.user_id=users.id WHERE alarm='${time}'`, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result.rows);
        });
    });
}

var getAlarmsForUser = function(discord_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`SELECT users.id, discord_id, alarm FROM users, alarms WHERE users.id = alarms.user_id AND discord_id='${discord_id}'`, function(err, result) {
            if (err) {
                return reject(err);
            }
            return resolve(result.rows)
        }); 
    });
}

module.exports = {
  userExists: (text) => userExists(text),
  createUser: (newUser, timezone) => createUser(newUser, timezone),
  deleteUser: (user_id) => deleteUser(user_id),
  addChannel: (channel_id) => addChannel(channel_id),
  deleteChannel: (channel_id) => deleteChannel(channel_id),
  createAlarm: (user_id, time) => createAlarm(user_id, time),
  deleteAlarm: (user_id, time) => deleteAlarm(user_id, time),
  deleteAllAlarms: (user_id) => deleteAllAlarms(user_id),
  parsetime: (text) => parsetime(text),
  parseTimezone: (text) => parseTimezone(text),
  setTimezone: (user_id, timezone) => setTimezone(user_id, timezone),
  getAlarmsAtTime: (time) => getAlarmsAtTime(time),
  getAlarmsForUser: (discord_id) => getAlarmsForUser(discord_id)
}
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false
    }
});

var dayjs = require ('dayjs');
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat);

var createUser = function(discord_id) {

    return new Promise(function (resolve, reject) {
        pool.query(`INSERT INTO users VALUES (DEFAULT, 1, now()::timestamp, '${discord_id}')`, function(err, result) {
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

var createAlarm = function(user_id, time) {

    return new Promise(function (resolve, reject) {
        pool.query(`INSERT INTO alarms VALUES (DEFAULT, '${user_id}', TO_TIMESTAMP('${time}', 'HH24:MI:SS')::TIME, now()::timestamp)`, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                if (result.rowCount > 0) {
                    return resolve(result.rows);
                }
            }
            return resolve(false);
        });
    });
};

var deleteAlarm = function(user_id) {

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

module.exports = {
  userExists: (text) => userExists(text),
  createUser: (newUser) => createUser(newUser),
  deleteUser: (user_id) => deleteUser(user_id),
  createAlarm: (user_id, time) => createAlarm(user_id, time),
  deleteAlarm: (user_id) => deleteAlarm(user_id),
  parsetime: (text) => parsetime(text)
}
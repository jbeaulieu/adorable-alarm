let Queue = require("bull");
const Discord = require('discord.js');
const db = require('./db');
const bot = new Discord.Client();

// Connect to a local redis instance locally, or the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Connect to the named work queue
let alarmProcessor = new Queue('alarm processing', REDIS_URL);

alarmProcessor.process(function(job, done){

    var today = new Date();
    var hours = today.getUTCHours();
    // Alarms occur at 15 minute intervals. We round the minute value down to the nearest multiple
    // of 15 in case the job is slightly delayed in running
    var minutes = (Math.floor(today.getUTCMinutes() / 15) * 15);
    if(minutes == 0) { minutes = '00'; } // Pad minute value with leading zero if needed

    var alarmTime = `${hours}:${minutes}:00`;

    console.log(`Processing alarms for ${alarmTime}`);

    // Connect to scraping queue so that we can pull job information
    let linkGenerator = new Queue('link scraping', REDIS_URL);

    // We can gather these promises in parallel since they don't depend on each other
    Promise.all([
        db.getAlarmsAtTime(alarmTime),                      // Get all alarms for current time
        linkGenerator.getJobs(['completed'], 0, 0, false),  // Get the most recent scraping job
        bot.login(process.env.TOKEN)                        // Log in with the discord bot
    ]).then((promises) => {
        var userList = promises[0];
        var job = promises[1];

        // The return value of the last scraping job will contain the most recently selected link
        var link = job[0].returnvalue;

        console.log(`Sending alarms to ${userList.length} users`);
        console.log(`Alarm link: ${link}`);

        // Get the discord id associated with each alarm, and send them a DM with the link
        userList.forEach(user_id => {
            bot.users.fetch(user_id.discord_id).then(user => {
                user.send(link);
            });
        });

        done(null, 'Alarms sent successfully')
    });
});
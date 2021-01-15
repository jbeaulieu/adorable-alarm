require('dotenv').config();
let express = require('express')
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
  bot.commands.set(botCommands[key].name, botCommands[key]);
});

let PORT = process.env.PORT || '5000';
const TOKEN = process.env.TOKEN;
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const Queue = require('bull');
let alarmProcessor = new Queue('alarm processing', REDIS_URL);

// Check if there is a repeatable job already set up in the redis instance to handle
// alarm processing. If there isn't, add a new one that runs every 15 minutes
alarmProcessor.getRepeatableJobs().then( (result) => { 
  
  var jobExists = false;

  result.forEach(job => {
    if(job.cron == '*/15 * * * *') { jobExists = true; }
  });

  if(!jobExists) {
    console.log('Creating new alarm processor job')
    alarmProcessor.add({service: 'reddit'}, {repeat: {cron: '*/15 * * * *'}});
  } else {
    console.log('Alarm processing job already exists')
  }
});

// Check if there is a repeatable job already in the redis instance to handle
// selecting links every hour. This is disabled in production in favor of Heroku's
// Scheduler add-on. However, uncommenting this block will spin up a similar job that
// can be used when working on a local machine.
/* let linkGenerator = new Queue('link scraping', REDIS_URL);
linkGenerator.getRepeatableJobs().then(

  (result) => { 
    var jobExists = false;

    result.forEach(job => {
      if(job.cron == '0 * * * *') { jobExists = true; }
    });

    if(!jobExists) {
      console.log('Creating new link scraper job')
      linkGenerator.add({service: 'reddit'}, {repeat: {cron: '0 * * * *'}});
    } else {
      console.log('Link scraper job already exists, not creating')
    }
  }
); */

let app = express();
app.use(express.static("public"))
app.listen(PORT, () => console.log("Server started!"));

bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
  const args = msg.content.split(/ +/);
  const command = args.shift().toLowerCase();
  console.info(`Called command: ${command}`);

  if (!bot.commands.has(command)) return;

  try {
    bot.commands.get(command).execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply('there was an error trying to execute that command!');
  }
});
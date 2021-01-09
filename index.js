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

let app = express();

const Queue = require('bull');

app.use(express.static("public"))

app.listen(PORT, () => console.log("Server started!"));

var scrapingQueue = new Queue('scraper', process.env.REDIS_URL);
scrapingQueue.process('scraper.js')

scrapingQueue.add('test', {repeat: {cron: '*/15 * * * *'}});

scrapingQueue.on('completed', function(job, result){
  console.log('Completed job');
})

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
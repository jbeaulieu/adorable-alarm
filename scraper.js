const Queue = require('bull');

let linkGenerator = new Queue('audio transcoding', process.env.REDIS_URL);

linkGenerator.process(function(job, done){

  const HTMLParser = require('node-html-parser');
  const fetch = require('node-fetch');

  const DOMAIN_PREFIX = 'http://reddit.com';
  const SUBREDDIT = 'aww'
  const SEARCH_LIMIT = '10'

  const base_url = `https://old.reddit.com/r/${SUBREDDIT}/hot/?limit=${SEARCH_LIMIT}`;

  let postList = [];

  fetch(base_url)
  .then(res => res.text())
  .then(body => {

      // Reddit labels posts with a 'thing' class, so pick all of them out of the page's html
      var root = HTMLParser.parse(body);
      var things = root.querySelectorAll('.thing');

      things.forEach(element => {
        if(!element.getAttribute('class').includes('stickied')) {
          // Filter out any stickied posts - they tend to be subreddit info pages / mod posts
          // For the rest, grab the post's permalink and add it to the list of possible choices
          postList.push(element.getAttribute('data-permalink'));
        }
      });

      // Choose a random number to select a post, and add the reddit.com domain prefix to make it a link
      var random = Math.floor(Math.random() * postList.length)
      var selection = DOMAIN_PREFIX + postList[random];
      console.log(`New link selected: ${selection}`);

      done(null, selection);

  }).catch(err => console.error(`Error: ${err}`));

});

linkGenerator.add();
module.exports = function(job){

    console.log('Starting job: ' + job);
  
    const HTMLParser = require('node-html-parser');
    const base_url = 'https://old.reddit.com/r/aww/hot/?limit=10';
  
    const fetch = require('node-fetch');
  
    let postList = []
  
    fetch(base_url)
        .then(res => res.text())
        .then(body => {
  
            var root = HTMLParser.parse(body);
            var thing = root.querySelectorAll('.thing');
            // console.log(thing[0].getAttribute('class').includes('stickied'));
            thing.forEach(element => {
              if(!element.getAttribute('class').includes('stickied')) {
                console.log(element.getAttribute('data-permalink') + ' | ' + element.querySelector('.score.unvoted').innerText);
                postList.push(element.getAttribute('data-permalink'));
              }
            });
            console.log('postlist')
            console.log(postList)
            var selection ='http://reddit.com' + postList[Math.floor(Math.random() * postList.length)];
            console.log('SELECTED: ' + selection)
            return selection;
    }).catch(err => console.error(err));
  
    return -1;
}
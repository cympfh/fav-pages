fs = require('fs');
path = require('path');
yaml = require('node-yaml');
express = require('express');
mustache = require('mustache')

config = yaml.readSync('./config.yml');
config.port = config.port || 8080;
config.num_per_page = config.num_per_page || 6;

function getfiles(cont) {
  fs.readdir(config.dir, (err, files) => {
    var ls = [];
    for (var filename of files) {
      if (/[0-9]*\.json/.test(filename)) {
        ls.push(filename);
      }
    }
    cont(ls);
  });
}

function sample(xs, n) {
  return xs.map((x) => [Math.random(), x]).sort().map((item) => item[1]).slice(0, n);
}

function readJson(filename) {
  var filepath = path.join(config.dir, filename);
  return JSON.parse(fs.readFileSync(filepath));
}

app = express();
app.get('/', (req, res) => {
  getfiles((ls) => {
    var files = sample(ls, config.num_per_page);
    var data = [];
    for (var filename of files) {
      var status = readJson(filename);
      data.push({'id_str': status.id_str, 'screen_name': status.user.screen_name});
    }
    var template = fs.readFileSync('./index.html', 'utf-8');
    res.send(mustache.render(template, {'status': data}));
  });
});

app.listen(config.port, () => {
  console.log(`Listen on ${config.port}`);
});

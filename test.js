var http = require('http');
var assert = require('assert');

var restc = require('./index');

var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World');
});

var client = restc({ port: 1337 },
  {
    before: function (options, next) {
      options.foo = true;
      return next();
    },
    after: function (req, res, next) {
      res.bar = true;
      return next();
    }
  }
);

server.listen(1337, '127.0.0.1', function () {
  console.log('Server running at http://127.0.0.1:1337');

  client.get('/', function (err, req, res, data) {
    if (err) throw err;
    console.log(data);
    assert(res.body == 'Hello World');
    assert(req.options.foo == true);
    assert(res.bar == true);
    process.exit();
  });

});


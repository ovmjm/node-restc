var http = require('http');
var aes = require('aesn');

var Client = function (defaults, plugins) {
  this.defaults = defaults || { };
  this.defaults.path = this.defaults.path || '';
  this.defaults.headers = this.defaults.headers || {};

  var noop = function () {};
  var defined = function (x) { return x !== undefined; };

  var setup = plugins.map(function (p) { return p.setup; }).filter(defined);
  this.before = plugins.map(function (p) { return p.before; }).filter(defined);
  this.after = plugins.map(function (p) { return p.after; }).filter(defined);

  aes.one(this.defaults, setup, noop);
};

Client.prototype.post = function (path, data, callback) {
  return this.request({ method: 'POST', path: path, data: data }, callback);
};

Client.prototype.put = function (path, data, callback) {
  return this.request({ method: 'PUT', data: data, path: path }, callback);
};

Client.prototype.get = function (path, callback) {
  return this.request({ method: 'GET', path: path }, callback);
};

Client.prototype.del = function (path, callback) {
  return this.request({ method: 'DELETE', path: path }, callback);
};

Client.prototype.request = function (options, callback) { var self = this;
  options.path = this.defaults.path + options.path;
  options.headers = options.headers || {};
  for (var k in this.defaults.headers) {
    if (!options.headers.hasOwnProperty(k)) options.headers[k] = this.defaults.headers[k];
  };
  options.__proto__ = this.defaults;
  aes.one(options, this.before, function (err) {
    if (err) return callback(err);

    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var data = '';
      res.on('data', function (chunck) {
        data += chunck;
      });
      res.on('end', function () {
        res.data = data;
        aes.two(req, res, self.after, function (err) {
          if (err) return callback(err);

          return callback(null, req, res, res.data);
        });
      });
    });
    req.options = options;

    req.on('error', function (err) {
      return callback(err);
    });

    if (options.data) {
      req.write(options.data);
    }
    req.end();
  });
};

module.exports = function (options) {
  return new Client(options, Array.prototype.slice.call(arguments, 1));
};


var formatter = function (config, next) {
  if (config.body === undefined) {
    config.body = config.data;
  }

  return next();
};

var parser = function (res, next) {
  res.data = res.body;

  return next();
};

module.exports = function (handlers, next) {
  handlers.before.push(formatter);
  handlers.after.push(parser);

  return next();
};

module.exports.formatter = function (handlers, next) {
  handlers.before.push(formatter);

  return next();
};

module.exports.parser = function (handlers, next) {
  handlers.after.push(parser);

  return next();
};


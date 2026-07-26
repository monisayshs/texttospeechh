const { get404Page } = require('../src/pages/errorPages');

module.exports = (req, res) => {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(get404Page());
};

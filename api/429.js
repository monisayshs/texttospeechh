const { get429Page } = require('../src/pages/errorPages');

module.exports = (req, res) => {
  res.statusCode = 429;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(get429Page());
};

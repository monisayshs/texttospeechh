const { get403Page } = require('../src/pages/errorPages');

module.exports = (req, res) => {
  res.statusCode = 403;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(get403Page());
};

const { get503Page } = require('../src/pages/errorPages');

module.exports = (req, res) => {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(get503Page());
};

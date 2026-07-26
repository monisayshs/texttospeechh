const { get500Page } = require('../src/pages/errorPages');

module.exports = (req, res) => {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(get500Page());
};

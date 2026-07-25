const statusHandler = require('../src/api/statusHandler');

module.exports = async (req, res) => {
  return statusHandler(req, res);
};

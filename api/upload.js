const uploadHandler = require('../src/api/uploadHandler');

module.exports = async (req, res) => {
  return uploadHandler(req, res);
};

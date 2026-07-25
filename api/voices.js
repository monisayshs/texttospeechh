const voicesHandler = require('../src/api/voicesHandler');

module.exports = async (req, res) => {
  return voicesHandler(req, res);
};

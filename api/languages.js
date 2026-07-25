const languagesHandler = require('../src/api/languagesHandler');

module.exports = async (req, res) => {
  return languagesHandler(req, res);
};

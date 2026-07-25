const generateHandler = require('../src/api/generateHandler');

module.exports = async (req, res) => {
  return generateHandler(req, res);
};

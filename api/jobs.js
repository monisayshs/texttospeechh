const jobsHandler = require('../src/api/jobsHandler');

module.exports = async (req, res) => {
  return jobsHandler(req, res);
};

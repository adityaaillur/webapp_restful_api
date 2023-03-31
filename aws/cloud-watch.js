var StatsD = require('node-statsd');
var client = new StatsD();

// In each API method, add the following code to increment the counter
// const apiCallCounter = (req, res, next) => {
module.exports = {
    client
};   

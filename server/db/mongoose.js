var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://46.101.37.173:27017/Inside");
mongoose.connect("mongodb://localhost:27017/Inside");

module.exports = {mongoose};

var mongoose = require('mongoose');

var ScriptSchema = new mongoose.Schema({
  title: String,
  content: String,
  count: {type: Number, default: 0}
});

ScriptSchema.methods.download = function(cb) {
  this.count += 1;
  this.save(cb);
};

mongoose.model('Script', ScriptSchema);
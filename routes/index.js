var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

var mongoose = require('mongoose');
var Script = mongoose.model('Script');

router.get('/api/scripts', function(req, res, next) {
  Script.find(function(err, scripts){
    if(err){ return next(err); }

    res.json(scripts);
  });
});

router.post('/api/scripts', function(req, res, next) {
  if (req.body._id) {
    var query = Script.findById(req.body._id);
    query.exec(function (err, script){
      if (err) { return next(err); }
      if (!script) { return next(new Error("can't find script")); }
      script.content = req.body.content;
      script.title = req.body.title;

      script.save(function(err, script){
        if(err){ return next(err); }
        res.json(script);
      });
    });
  } else {
    var script = new Script(req.body);
    script.save(function(err, script){
      if(err){ return next(err); }
      res.json(script);
    });
  }
});

router.param('script', function(req, res, next, id) {
  var query = Script.findById(id);

  query.exec(function (err, script){
    if (err) { return next(err); }
    if (!script) { return next(new Error("can't find script")); }

    req.script = script;
    return next();
  });
});

router.get('/api/scripts/:script', function(req, res) {
  res.json(req.script);
});

router.put('/api/scripts/:script/download', function(req, res, next) {
  req.script.download(function(err, script){
    if (err) { return next(err); }

    res.json(script);
  });
});

router.delete('/api/scripts/:script', function(req, res) {
  req.script.remove(function(err, script){
    if (err) { return next(err); }

    res.json(script);
  });
});

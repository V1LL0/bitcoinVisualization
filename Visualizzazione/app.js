
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var mongo = require('mongodb');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
// app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Cache enabling
app.configure('production', function(){
  var oneDay = 86400000;
  app.use(express.static(__dirname + '/public', { maxAge: oneDay }));
  app.use(express.errorHandler());
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//ROUTES
app.get('/', function(req, res, next){
  res.render("index");  
} );

//router.get(...)
app.get('/minerList', function(req, res) {
    var db = req.db;
    var collection = db.get('addresses');
    var num = 0;
    var minerDict = {}
    collection.find({},{},function(e,miner){
        res.json('miners', {
            num : miner['_id'] //Da testare
        });
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
}); 





/////////MONGO////////////////

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/bitcoinDB", function(err, db) {
	// Get an aggregation cursor
	var collection = db.collection('addresses');

	collection.find().toArray(function(err, docs) {
		console.log(docs);
	});

});



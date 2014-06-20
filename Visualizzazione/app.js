
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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
}); 


//router.get(...)
app.get('/minerList', function(req, res) {
  res.end(JSON.stringify(minerDictionary));
});

app.get('/minerInteractionsList', function(req, res) {
  res.end(JSON.stringify(minersInteractions));
});

/////////MONGO////////////////

var minerDictionary = {}
var minersInteractions = {} // hash -> [hash_destinazioni]

// var ObjectID = mongo.ObjectID;
var BSON = mongo.BSONPure; 

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/bitcoinDB", initData);

function getMinerList(err, db){
  var num = 0;
  db.collection('addresses').find({'_type':'address'},{'_id':1}).toArray(function(err, items) {
    var MAX = 50;
    items.forEach(function(miner){
      if (num<MAX){
        minerDictionary[num] = miner['_id'];
        num++;
      }
    });
    // console.log(JSON.stringify(minerDictionary))
    console.log("node loaded")    
    getMinersInteraction(err, db);
  });
}

//Crea un dizionario in cui memorizza quali minatori hanno pagati altri minatori
// function getMinersInteraction(err, db){ //TODO: da rendere asincrono: http://justinklemm.com/node-js-async-tutorial/
//   Object.keys(minerDictionary).forEach(function(key){
//     console.log(key)
//     var miner_id = minerDictionary[key];
//     console.log(miner_id)
//     console.log(miner_id.length)    
//     db.collection('addresses').findOne({_id: miner_id},{'tx_payment':1, '_id':0}, function(err, miner_txs){
//       console.log(miner_txs);
//       address_receving = miner_txs['addressesValue_receving'];
//       if ( address_receving != null && address_receving.length > 0){
//         console.log("miner_txs presenti")
//         console.log(JSON.stringify(address_receving))
//         minersInteractions[miner_id] = address_receving;
//       }
//     });
//   });
//   // console.log(JSON.stringify(minersInteractions))
//   // console.log("links loaded")

//   // console.log("all data are loaded")
// }

//VERSIONE DI PROVA
function getMinersInteraction(err, db){
  function random(start, end){
    return parseInt(Math.random()*(end-start)) + start;
  }
  var num_links = random(10,30);
  dictonary_length = Object.keys(minerDictionary).length;
  for (var i=0; i<num_links; i++){
    key = random(0, dictonary_length);
    hash = minerDictionary[key];
    links = [];
    num_links_per_node = random(0,10);
    for (var j=0; j<num_links_per_node; j++)
      links.push( minerDictionary[random(0, dictonary_length)] );
    minersInteractions[hash] = links;
  }

  console.log(JSON.stringify(minersInteractions));
  console.log("links loaded");
}

function initData(err, db){
  getMinerList(err, db);
}


/**
 * Module dependencies.
 */

var express = require('express')
, http = require('http')
, path = require('path');

var mongo = require('mongodb');

var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
//app.use(express.favicon());
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

//development only
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
app.get('/minersList', function(req, res) {
	res.end(JSON.stringify(minersDictionary));
});

app.get('/minersInteractionsList', function(req, res) {
	res.end(JSON.stringify(minersInteractionsDictionary));
});

app.get('/wheelData', function(req, res) {
	res.end(JSON.stringify(wheelData));
});

/////////UTILITIES///////////

Object.values = function(obj){
	var keys = Object.keys(obj);
	var values = [];
	keys.forEach(function(key){
		values.push(obj[key]);
	})
	return values;
}


/////////MONGO////////////////

var minersDictionary = {}
var minersInteractionsDictionary = {} // hash -> [hash_destinazioni]

var miner_miningCountList = {};
var miningCountThreshold = 2; 

//for wheel
var wheelData = {}

//var ObjectID = mongo.ObjectID;
var BSON = mongo.BSONPure; 

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/bitcoinDB", initData);

function getMinerList(err, db){
	var num = 0;

	db.collection('addresses').find({'miningCount' : {$gt:miningCountThreshold}},{'_id':1, 'miningCount':1}).toArray(function(err, items) {

		items.forEach(function(miner){
			minersDictionary[num] = {"_id" : miner['_id'], "miningCount" : miner['miningCount']};
			num++;
		});
		console.log("node loaded")

		getMinersInteraction(err, db);
	});
}


//Crea un dizionario in cui memorizza quali minatori hanno pagati altri minatori
function getMinersInteraction(err, db){ //TODO: da rendere asincrono: http://justinklemm.com/node-js-async-tutorial/
	var minersIndexsList = Object.keys(minersDictionary);
	var minersHashesList = Object.values(minersDictionary);
	var count = minersIndexsList.length;

	minersIndexsList.forEach(function(key){
		var miner = minersDictionary[key];
		
		db.collection('addresses').findOne({_id: miner['_id']},{'tx_payment':1, '_id':0}, function(err, miner_txs){
			count--;
			var tx_payment_list = miner_txs['tx_payment'];

			if ( tx_payment_list != null && tx_payment_list.length > 0){
				tx_payment_list.forEach(function (tx_payment){
					tx_payment['addressesValue_receving'].forEach(function(addressValue_receivingCouple){
						var addressReceiving = addressValue_receivingCouple[0];
						if(minersHashesList.indexOf(addressReceiving) >= 0){
							if(minersInteractionsDictionary[miner['_id']])
								minersInteractionsDictionary[miner['_id']].push(addressReceiving);
							else{
								minersInteractionsDictionary[miner['_id']] = [addressReceiving];
							}
						}
					})

				})
			}
			if (count == 0){
				console.log("links loaded")
				console.log('Nodes: '+Object.keys(minersDictionary).length);
				console.log("all data are loaded")
//				createData(minersDictionary, minersInteractionsDictionary);
				
			}
		});
	});

}


function initData(err, db){
	getMinerList(err, db);
}


/*
*//*************** WHEEL ***************//*
function createData(numberHashMap, hashto_HashList){
	wheelData={
			packageNames:[],
			matrix: []
	}
	// console.log(numberHashMap);
	// console.log(hashto_HashList);


	wheelData.packageNames = Object.keys(numberHashMap);

	var row = [];

	wheelData.packageNames.forEach(function(item){
		row = []
		wheelData.packageNames.forEach(function(item2){	
			if (item !== item2){
				if(hashto_HashList[numberHashMap[item]]===undefined)
					row.push(0);
				else
					if(hashto_HashList[numberHashMap[item]].indexOf(numberHashMap[item2]) > -1)
						row.push(1);
					else
						row.push(0);
			}
			else
				row.push(0);

		});

		wheelData.matrix.push(row);			

	});

	console.log("data wheel loaded")

	console.log("all data are loaded")
}
*/
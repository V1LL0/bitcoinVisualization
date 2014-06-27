
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
app.get('/minerList', function(req, res) {
	res.end(JSON.stringify(minerDictionary));
});

app.get('/minerInteractionsList', function(req, res) {
	res.end(JSON.stringify(minersInteractions));
});

app.get('/wheelData', function(req, res) {
	res.end(JSON.stringify(wheelData));
});

/////////MONGO////////////////

var minerDictionary = {}
var minersInteractions = {} // hash -> [hash_destinazioni]

//for wheel
var wheelData = {}

//var ObjectID = mongo.ObjectID;
var BSON = mongo.BSONPure; 

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/bitcoinDB", initData);

function getMinerList(err, db){
	var num = 0;
	db.collection('addresses').find({'_type':'address'},{'_id':1}).toArray(function(err, items) {
		var MAX = 10000;
		var MIN = 0;
//		var MIN = 0;
		var toskip = 0;
		items.forEach(function(miner){
//			if (toskip>=MIN && toskip<MAX+MIN){
			minerDictionary[num] = miner['_id'];
			num++;
//			}
			toskip++;
		});
		console.log("node loaded")    
		getMinersInteraction(err, db);
	});
}

//Crea un dizionario in cui memorizza quali minatori hanno pagati altri minatori
function getMinersInteraction(err, db){ //TODO: da rendere asincrono: http://justinklemm.com/node-js-async-tutorial/ 
	var minersList = Object.keys(minerDictionary);
	var count = minersList.length;
	minersList.forEach(function(key){
		var miner_id = minerDictionary[key];
		//    count++;
		db.collection('addresses').findOne({_id: miner_id},{'tx_payment':1, '_id':0}, function(err, miner_txs){
			count--;
//			console.log("count: " + count)
//			console.log("miner_id: " + miner_id);
//			console.log("minerstxs: " + JSON.stringify(miner_txs));
			var tx_payment_list = miner_txs['tx_payment'];
			//console.log(tx_payment_list);
			if ( tx_payment_list != null && tx_payment_list.length > 0){
				//        console.log("miner_txs presenti")
				//        console.log(JSON.stringify(tx_payment_list))
				tx_payment_list.forEach(function (tx_payment){
					//console.log(tx_payment);
					tx_payment['addressesValue_receving'].forEach(function(addressValue_receivingCouple){
						var addressReceiving = addressValue_receivingCouple[0];
						//                             console.log(addressReceiving)
						if(minersList.indexOf(addressReceiving) >= 0){
							console.log("infatti non entro")
							if(minersInteractions[miner_id])
								minersInteractions[miner_id].push(addressReceiving);
							else{
								console.log("se non stampavo prima, figurati adesso");
								minersInteractions[miner_id] = [addressReceiving];
							}
						}
					})

				})
				if (count == 0){
					console.log(JSON.stringify(minersInteractions))
					console.log("links loaded")

					console.log("all data are loaded")
					createData(minerDictionary, minersInteractions);
				}
			}

		})

	})
}


//////VERSIONE DI PROVA
//function getMinersInteraction(err, db){
//function random(start, end){
//return parseInt(Math.random()*(end-start)) + start;
//}
//var num_links = random(100,300);
//dictonary_length = Object.keys(minerDictionary).length;
//for (var i=0; i<num_links; i++){
//key = random(0, dictonary_length);
//hash = minerDictionary[key];
//links = [];
//num_links_per_node = random(0,10);
//for (var j=0; j<num_links_per_node; j++)
//links.push( minerDictionary[random(0, dictonary_length)] );
//minersInteractions[hash] = links;
//}

//console.log(JSON.stringify(minersInteractions));
//console.log("links loaded");
//createData(minerDictionary, minersInteractions);
//}

function initData(err, db){
	getMinerList(err, db);
}



/*************** WHEEL ***************/
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
}







//Prova
//{'1':'abc', '2':'bdfg', '3':'casfg', '4':'dasfg', '5':'ekiuj', '6':'fertey'};
//{'abc':['bdfg', 'casfg'], 'dasfg':['casfg', 'ekiuj', 'bdfg'], 'casfg':['fertey', 'abc', 'bdfg'], 
//'dasfg':['abc'], 'ekiuj':['abc', 'bdfg'], 'fertey':['abc', 'bdfg', 'ekiuj']};











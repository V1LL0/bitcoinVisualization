
/**
 * Module dependencies.
 */

var express = require('express')
, fs = require('fs')
, http = require('http')
, path = require('path');

var mongo = require('mongodb');

var app = express();

var async = require('async');

/**************************** FILTRI ***************************/

var blockTimeStampMin = 1293002065;
var blockTimeStampMax = 1304145665;

var minMiningCount = 30;
var maxMiningCount = 100;

var minMinersInBlock = 1;
var maxMinersInBlock = 10;


/***************************************************************/



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

app.get('/time2CollaborativeMiners', function(req, res) {
	if(req.query.minTS && req.query.maxTS && req.query.minMiningCount && req.query.maxMiningCount
			&& req.query.minMinersInBlock && req.query.maxMinersInBlock){
		//filtro Time Stamp
		blockTimeStampMin = parseInt(req.query.minTS);
		blockTimeStampMax = parseInt(req.query.maxTS);

		//filtro Mining Count
		minMiningCount = parseInt(req.query.minMiningCount);
		maxMiningCount = parseInt(req.query.maxMiningCount);

		//filtro Miners Count In Block
		minMinersInBlock = parseInt(req.query.minMinersInBlock);
		maxMinersInBlock = parseInt(req.query.maxMinersInBlock);

		getCollaborativeMiners(null, dataBase, res);

	}
	else
		res.end(JSON.stringify(time2CollaborativeMiners));
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

var minersDictionary = {} // int -> hash
var minersInteractionsDictionary = {} // hash -> [hash_destinazioni]
var time2CollaborativeMiners = {} // timestamp -> { size:int, miners:minser_list }

var miner_miningCountList = {};
var miningCountThreshold = 2; 

//for wheel
var wheelData = {}

//var ObjectID = mongo.ObjectID;
var BSON = mongo.BSONPure; 

var MongoClient = require('mongodb').MongoClient;
var dataBase = "";
MongoClient.connect("mongodb://localhost:27017/bitcoinDB", initData);

/***************************************************************/
/*************************   FILTRI   **************************/
/***************************************************************/


function getMinerList(err, db){
	var num = 0;
	var resultsLimit = 100;

	db.collection('addresses').find(/*{'miningCount' : {$gt:miningCountThreshold}},*/{},{'_id':1, 'miningCount':1}).limit(resultsLimit).toArray(function(err, items) {

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
				getCollaborativeMiners(err, db);
//				createData(minersDictionary, minersInteractionsDictionary);

			}
		});
	});

}

/*function getCollaborativeMiners(err, db, res){
	var resultsLimit = 150000;
	time2CollaborativeMiners = {};

	db.collection('transactions').find({"addressesValue_sending":{"$size":0}},{"addressesValue_receving":1, "_id":0, "time":1}).limit(resultsLimit).toArray(function(err, addressesValueReceiving_time_list) {

		// console.log(JSON.stringify(addressesValueReceiving_time_list))
		addressesValueReceiving_time_list.forEach(function(addressesValueReceiving_time, index){
			var time = addressesValueReceiving_time['time'];

			if(time >= blockTimeStampMin && time <= blockTimeStampMax){	
				var addressValueReceivingList = addressesValueReceiving_time['addressesValue_receving'];
				addressValueReceivingList.forEach(function(addressValueReceiving){
					var addressReceiving = addressValueReceiving[0];

					var miningCountToCheck = 0;
					db.collection('addresses').findOne({"_id": addressReceiving}, {"_id":0, "miningCount":1}, function(err, document){
						miningCountToCheck = document.miningCount;

						if(miningCountToCheck>=minMiningCount && miningCountToCheck <= maxMiningCount)
							if(time2CollaborativeMiners[time]){
								collaborativeMiners = time2CollaborativeMiners[time];
								collaborativeMiners['size'] = collaborativeMiners['size']+1;
								collaborativeMiners['miners'].push(addressReceiving);
								console.log(time2CollaborativeMiners[time]);
							}
							else{
								time2CollaborativeMiners[time] = {"size":1, "miners":[addressReceiving]};
							}
					});
				});
			}


				if(res!== undefined){
					res.end(JSON.stringify(time2CollaborativeMiners));
				}
				console.log(JSON.stringify(time2CollaborativeMiners));
				console.log("all data loaded");


		});
		//Salvataggio file CSV
				var csv = "ADDRESSES";
		var allTimeStamps = Object.keys(time2CollaborativeMiners);
		var allMiners = [];

		var pathToFile = "/home/massimo/Desktop/collaborativeMiners.csv";
		fs.openSync(pathToFile, "w")
		var writer = fs.createWriteStream(pathToFile, {'flags': 'a'});

		var time2CollaborativeMinersFiltered = {};

		allTimeStamps.forEach(function(timeStamp){
			if(time2CollaborativeMiners[timeStamp]['miners'].length > 1)
				time2CollaborativeMinersFiltered[timeStamp]=time2CollaborativeMiners[timeStamp];
		});



		//preparazione header
		allTimeStamps.forEach(function(ts){
			csv+=", "+ts;
		});
		writer.write(csv+"\n");
		//prendo tutti i miner
		var allTimeStampsFiltered = allTimeStamps; 
			Object.keys(time2CollaborativeMinersFiltered);
		allTimeStampsFiltered.forEach(function(ts){
			time2CollaborativeMinersFiltered[ts]['miners'].forEach(function(miner){
				if(allMiners.indexOf(miner)<0)
					allMiners.push(miner);
			});
		});

		//da togliere
		//time2CollaborativeMinersFiltered = time2CollaborativeMiners;
				for(var i=0; i<allMiners.length; i++){
			var count=0;
			csv=allMiners[i];
			for(var j=0; j<allTimeStampsFiltered.length; j++){
				if(time2CollaborativeMinersFiltered[allTimeStampsFiltered[j]]["miners"].indexOf(allMiners[i])>=0){
					count++;
					csv+=", "+"X";
				}
				else
					csv+=",  ";
			}
			//finita riga
			writer.write(csv+", "+count+"\n");
		//console.log(csv+", "+count+"\n");
		//}

	});


}*/




function getCollaborativeMiners(err, db, res){
	var resultsLimit = 100000;
	time2CollaborativeMiners = {};

	db.collection('transactions').find({"addressesValue_sending":{"$size":0}},{"addressesValue_receving":1, "_id":0, "time":1}).limit(resultsLimit).toArray(function(err, addressesValueReceiving_time_list) {
		// console.log(JSON.stringify(addressesValueReceiving_time_list))
		async.eachSeries(addressesValueReceiving_time_list, function(addressesValueReceiving_time, callback){
			var time = addressesValueReceiving_time['time'];

			if(time >= blockTimeStampMin && time <= blockTimeStampMax){
				var addressValueReceivingList = addressesValueReceiving_time['addressesValue_receving'];
				var listLength = addressValueReceivingList.length;
//				console.log(addressValueReceivingList);
				/*console.log("ciaooooo11")
				console.log("minMinersInBlock "+minMinersInBlock);
				console.log("maxMinersInBlock "+maxMinersInBlock);
				console.log("listLength "+listLength);*/
				//if(listLength >= minMinersInBlock && listLength <= maxMinersInBlock){
					async.eachSeries(addressValueReceivingList, function(addressValueReceiving, callback2){
						var addressReceiving = addressValueReceiving[0];

						var miningCountToCheck = 0;
						db.collection('addresses').findOne({"_id": addressReceiving}, {"_id":0, "miningCount":1}, function(err, document){
							miningCountToCheck = document.miningCount;

							if(miningCountToCheck>=minMiningCount && miningCountToCheck <= maxMiningCount)
								if(time2CollaborativeMiners[time]){
									collaborativeMiners = time2CollaborativeMiners[time];
									collaborativeMiners['size'] = collaborativeMiners['size']+1;
									collaborativeMiners['miners'].push(addressReceiving);
								}
								else{
									time2CollaborativeMiners[time] = {"size":1, "miners":[addressReceiving]};
								}
							callback2();
						});
					}, function(err){
						callback();
					});

//				}
//				callback();
			}
			callback();


		}, function(err){

			if(res!== undefined){
				res.end(JSON.stringify(time2CollaborativeMiners));
			}
			console.log(JSON.stringify(time2CollaborativeMiners));
			console.log("all data loaded");



		});

	});

}



function initData(err, db){
	dataBase = db;
	//getMinerList(err, db);
	getCollaborativeMiners(err, db, undefined);
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

	console.log("all data loaded")
}
  */
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/bitcoinDB", function(err, db) {
	// Get an aggregation cursor
	var collection = db.collection('addresses');

	collection.find().toArray(function(err, docs) {
		assert.equal(null, err);
		assert.equal(3, docs.length);
	});

});

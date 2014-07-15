#!/usr/bin/python

from pymongo import *
import json
from bson.json_util import dumps
import bson.json_util as json_util
from bson import ObjectId
from macro import *
from address import Address
from transaction import Transaction


class Dao:

	def __init__(self, converter):
		self.client = MongoClient()
		self.converter = converter
		self.db = self.client['bitcoinDB']

		#	DA TOGLIERE A FINE TEST
		# self.dropDB()
		# self.db = self.client['bitcoinDB']


	def insertAddress(self, address, tx):
		# self.db.addresses.insert(self.encode_address(address))
		# self.db.transactions.insert(self.encode_transaction(tx))
		self.db.addresses.update({"_id" : address._id}, self.encode_address(address),upsert=True)
		self.db.transactions.update({"_id" : tx._id}, self.encode_transaction(tx),upsert=True)

	def getAddress(self, address_hash):
		#print "address_hash: "+str(address_hash)
		#return self.db.addresses.find_one({"_id" : address_hash})
		return self.decode_address( self.db.addresses.find({"_id" : address_hash})[0] )

	def getTransaction(self, tx_id):
		return self.decode_transaction(self.db.transactions.find({"_id" : tx_id}))


	def updateAddress(self, address, tx):
		self.db.addresses.update({"_id" : address._id}, self.encode_address(address))
		self.db.transactions.update({"_id" : tx._id}, self.encode_transaction(tx),upsert=True)

	def addressesCount(self):
		return self.db.addresses.count

	def getMinersList(self):
		def objList2StringList(objList):
			stringList = []
			for miner in objList:
				stringList.append(miner['_id'])
			return stringList

		return objList2StringList( self.db.addresses.find({},{"_id":1}) )



	def calculateFee(self, tx):
		if tx.value_in > 0:
			return tx.value_in - tx.value_out
		
		profit = float(50)
		while True:
			fee = tx.value_out - profit
			profit = profit / 2
			if fee >= 0:
				return fee	


	def insertMining(self, address, mining):
		self.db.addresses.update({ "_id": address },{ "$addToSet": { "tx_mining": self.encode_transaction(mining)  },
													  "$inc": { "miningCount": 1 },
													  "$inc": { "totFees": self.calculateFee(mining) }
													  })

	def insertPayment(self, address, payment):
		self.db.addresses.update({ "_id": address },{ "$addToSet": { "tx_payment": self.encode_transaction(payment) },
													"$inc": { "currentBitCoin": -payment.value_out } })

	def insertCredit(self, address, credit):
		self.db.addresses.update({ "_id": address },{ "$addToSet": { "tx_credit": self.encode_transaction(credit) },
													"$inc": { "currentBitCoin": credit.value_in } })



	def dropDB(self):
		self.db._command({'dropDatabase' : 1})


	def encode_address(self, address):

		def default(self, o):
			if isinstance(o, ObjectId):
				return str(o)

		txMining = []
		for txM in address.tx_mining:
			txMining.append(txM._id)

		txPayement=[]
		for txP in address.tx_payment:
			txPayement.append(txP._id)

		txCredit=[]
		for txC in address.tx_credit:
			txCredit.append(txC._id)

		return {"_type" : "address", \
				"_id" : address._id, \
				"miningCount" : address.miningCount, \
				"tx_mining" : txMining,\
				"tx_payment" : txPayement, \
				"tx_credit" : txCredit, \
				"totBitCoinMined" : address.totBitCoinMined,\
				"totDollarMined" : address.totDollarMined, \
				"currentBitCoin" : address.currentBitCoin, \
				"totFees" : address.totFees}


	def decode_address(self, document):
		assert document["_type"] == "address"
		address = Address(document['_id'], self.converter)
		address.miningCount = document["miningCount"]
		
		for txM in document['tx_mining']:
			address.tx_mining.append(self.getTransaction(txM))

		for txP in document['tx_payment']:
			address.tx_payment.append(self.getTransaction(txP))
	
		for txC in document['tx_credit']:
			address.tx_credit.append(self.getTransaction(txC))
	
		address.totBitCoinMined = document['totBitCoinMined']
		address.totDollarMined = document['totDollarMined']
		address.currentBitCoin = document['currentBitCoin']
		address.totFees = document['totFees']

		return address

	
	
	def encode_transaction(self, transaction):
	
			def default(self, o):
				if isinstance(o, ObjectId):
					return str(o)
	
			addressesValueReceving=[]
			for avR in transaction.addressesValue_receving:
				addressesValueReceving.append(avR)
	
			addressesValueSending=[]
			for avS in transaction.addressesValue_sending:
				addressesValueSending.append(avS)
	
			return {"_type" : "transaction", \
					"_id" : transaction._id, \
					"time" : transaction.time, \
					"value_in" : transaction.value_in,\
					"value_out" : transaction.value_out, \
					"addressesValue_receving" : addressesValueReceving,\
					"addressesValue_sending" : addressesValueSending}
	
	
	def decode_transaction(self, document):
			assert document["_type"] == "transaction"
			transaction = Transaction(document['_id'], document["time"])
			transaction.value_in = document['value_in']
			transaction.value_out = document['value_out']
			transaction.addressesValue_receving = document['addressesValue_receving']
			transaction.addressesValue_sending = document['addressesValue_sending']
	
			return transaction



	def updateMiningCount(self, address):
		newMiningCount = len(self.db.addresses.find({"_id":address},{"_id":0,"tx_mining":1})[0]["tx_mining"])
		self.db.addresses.update({ "_id": address },{"$set": {"miningCount": newMiningCount}})




	
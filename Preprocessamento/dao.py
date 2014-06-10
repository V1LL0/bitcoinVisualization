#!/usr/bin/python

from pymongo import *
import json
from bson.json_util import dumps
import bson.json_util as json_util
from macro import *
from address import Address
from transaction import Transaction


class Dao:

	def __init__(self):
		self.client = MongoClient()
		self.db = self.client['bitcoinDB']

	def insertAddress(self, address):
#		toSave = json.dumps(address, default=json_util.default)

		#res = self.db.addresses.insert(toSave)
		res = self.db.addresses.insert(self.encode_address(address))
		printJson(res)

	def findAddress(self, address_hash):
		self.db.addresses.find_one({"hash" : address_hash})

	def addressesCount(self):
		return db.addresses.count



	#def encodeAddress(self, obj):
	#	return 	json.dumps(obj.__dict__)


	def encode_address(self, address):

		txMining = []
		print ("Addressaaaa: "+str(type(address)))
		print ("Tx mining: "+str(type(address.tx_mining)))
		
		for txM in address.tx_mining:
			txMining.append(self.encode_transaction(txM))

		txPayement=[]
		for txP in address.tx_payment:
			txPayement.append(self.encode_transaction(txP))

		txCredit=[]
		for txC in address.tx_credit:
			txCredit.append(self.encode_transaction(txC))

		return {"_type" : "address", "hash" : address.hash, "miningCount" : address.miningCount, "tx_mining" : txMining,
				"tx_payment" : txPayement, "tx_credit" : txCredit, "totBitCoinMined" : address.totBitCoinMined,
				"totDollarMined" : address.totDollarMined, "currentBitCoin" : address.currentBitCoin, "totFees" : address.totFees}


	'''
	def decode_address(document):
		assert document["_type"] == "address"
		return Address(document)
	'''


	def encode_transaction(self, transaction):

		addressesValueReceving=[]
		for avR in transaction.addressesValue_receving:
			avR=Address(avR[0])
			addressesValueReceving.append(self.encode_address(avR))

		addressesValueSending=[]
		for avS in transaction.addressesValue_sending:
			avS=Address(avS[0])
			addressesValueSending.append(self.encode_address(avS))

		return {"_type" : "transaction", "_id" : transaction._id, "time" : transaction.time, "value_in" : transaction.value_in,
				"value_out" : transaction.value_out, "addressesValue_receving" : addressesValueReceving,
				"addressesValue_sending" : addressesValueSending}


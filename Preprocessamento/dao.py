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
		self.db = self.client['bitcoinDB']
		self.converter = converter

	def insertAddress(self, address):
		res = self.db.addresses.insert(self.encode_address(address))
		printJson(res)

	def getAddress(self, address_hash):
		self.db.addresses.find_one({"_id" : address_hash})

	def updateAddress(self, address):
		self.db.addresses.update({"_id" : address._id}, address )

	def addressesCount(self):
		return self.db.addresses.count







	def encode_address(self, address):

		def default(self, o):
			if isinstance(o, ObjectId):
				return str(o)


		txMining = []
		
		for txM in address.tx_mining:
			txMining.append(self.encode_transaction(txM))

		txPayement=[]
		for txP in address.tx_payment:
			txPayement.append(self.encode_transaction(txP))

		txCredit=[]
		for txC in address.tx_credit:
			txCredit.append(self.encode_transaction(txC))

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


	'''
	def decode_address(document):
		assert document["_type"] == "address"
		return Address(document)
	'''

	def decode_address(self, document):
		assert document["_type"] == "address"
		address = Address(document._id, self.converter)
		address.miningCount = document.miningCount
		
		for tx in document.tx_mining:
			address.tx_mining.append(decode_transaction(tx))

		for tx in document.tx_payment:
			address.tx_payment.append(decode_transaction(tx))
	
		for tx in document.tx_credit:
			address.tx_credit.append(decode_transaction(tx))
	
		address.totBitCoinMined = document.totBitCoinMined
		address.totDollarMined = document.totDollarMined
		address.currentBitCoin = document.currentBitCoin
		address.totFees = document.totFees

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
		transaction = Transaction(document._id, document.time)
		transaction.value_in = document.value_in
		transaction.value_out = document.value_out
		transaction.addressesValue_receving = document.addressesValue_receving
		transaction.addressesValue_sending = document.addressesValue_sending

		return transaction



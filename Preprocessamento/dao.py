#!/usr/bin/python

from pymongo import *
import json
from bson.json_util import dumps

from macro import *
from address import Address
from transaction import Transaction


class Dao:

	def __init__(self):
		self.client = MongoClient()
		self.db = self.client['bitcoinDB']
		

	def insertAddress(self, address):
		res = self.db.addresses.insert(self.encodeAddress(address))
		printJson(res)

	def findAddress(self, address_hash):
		self.db.addresses.find_one({"hash" : address_hash})

	def addressesCount(self):
		return db.addresses.count



	def encodeAddress(self, obj):

		return obj
		# return 	json.dumps(obj.__dict__)

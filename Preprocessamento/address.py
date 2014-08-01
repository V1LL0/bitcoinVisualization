#! /user/bin/pyton
import json

from bitcoinConverter import BitcoinConverter

def getStringFromTx(list):
	# return str([str(tx) for tx in list])
	output = '-'.join(str(tx) for tx in list)
	return "[ " + output + " ]"

class Address:


	def __init__(self, address, converter):
		self.converter = converter

		self._id = address
		#self.hash = address
		self.miningCount = 0
		self.tx_mining = []
		self.tx_payment = []
		self.tx_credit = []
		self.totBitCoinMined = 0
		self.totDollarMined = 0
		self.currentBitCoin = 0
		self.totFees = 0		

	def __str__(self):
		return "{" +  \
				"\n\t" + "hash : " + str(self._id) +  \
				"\n\t" + "miningCount : " + str(self.miningCount) + \
				"\n\t" + "tx_mining : " + getStringFromTx(self.tx_mining) + \
				"\n\t" + "tx_payment : " + getStringFromTx(self.tx_payment) + \
				"\n\t" + "tx_credit : " + getStringFromTx(self.tx_credit) + \
				"\n\t" + "totFees : " + str(self.totFees) + \
				"\n\t" + "totBitCoinMined : " + str(self.totBitCoinMined) + \
				"\n\t" + "totDollarMined : " + str(self.totDollarMined) + \
				"\n\t" + "currentBitCoin : " + str(self.currentBitCoin) + \
				"\n}"

	# def __repr__(self):
	# 	return str(self)

	def to_JSON(self):
		return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)

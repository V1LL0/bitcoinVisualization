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

# 	def addNewPayment(self, tx):	
# 		# print "addNewPayment"
# 		self.tx_payment.append(tx)
# 		self.currentBitCoin = self.currentBitCoin - tx.value_out
# 
# 	def addNewCredit(self, tx):	
# 		# print "addNewCredit"
# 		self.tx_credit.append(tx)
# 		self.currentBitCoin = self.currentBitCoin + tx.value_in
# 
# 	def addNewMining(self, tx, value):
# 		# print "addNewMining"
# 		self.miningCount = self.miningCount + 1
# 		self.tx_mining.append(tx)
# 		fee = self.calculateFee(tx)
# 		# if(fee>0):
# 		# 	print(tx)
# 		# 	print(fee)
# 		self.totFees = self.totFees + fee
# 
# 		#Concettualmente da rivedere, se la transazione di mining viene gia' spartita, devo considerare
# 		#che ognuno dei partecipanti ha minato 50 btc? oppure che ognuno ha minato la parte che gli sta arrivando?
# 		#Ora come ora stiamo considerando che ogni partecipante mina il totale, che dovrebbe essere 50!
# 		#
# 		#value = sum(elem[1] for elem in tx.addressesValue_receving) #inutile da calcolare!
# 		self.totBitCoinMined = self.totBitCoinMined + value#tx.value_in#value # e' gia' il value senza la fee questo!   - fee)
# 		self.totDollarMined = self.totDollarMined + self.converter.convertBitcoin(value, tx)
# 		self.currentBitCoin = self.currentBitCoin + value


	# def calculateFee(value_in, value_out):
	# 	if value_in > 0:
	# 		return value_in - value_out
		
	# 	profit = float(50)
	# 	while True:
	# 		fee = value_out - profit
	# 		profit = profit / 2
	# 		if fee >= 0:
	# 			return fee	

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

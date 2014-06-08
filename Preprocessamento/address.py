#! /user/bin/pyton

def getStringFromTx(list):
	return str([str(tx) for tx in list])

class Address:

	def __init__(self, address, tx):

		self.hash = address
		self.miningCount = 1
		self.tx_mining = [tx]
		self.tx_payment = []
		self.tx_credit = []
		value = sum(elem[1] for elem in tx.addressesValue_receving)
		self.totBitCoinMined = value
		self.totDollarMined = value
		self.currentBitCoin = value


	def addNewPayment(self, tx):	
		self.tx_payment.append(tx_obj)
		self.currentBitCoin = self.currentBitCoin - tx['output']

	def addNewCredit(self, tx):	
		self.tx_credit.append(tx_obj)
		self.currentBitCoin = self.currentBitCoin + tx['input']

	def addNewMining(self, tx):
		self.miningCount += 1 
		self.tx_mining.append(tx)
		value = sum(elem[1] for elem in tx.addressesValue_receving)
		self.totBitCoinMined = self.totBitCoinMined + value
		self.totDollarMined = self.totDollarMined + value
		self.currentBitCoin = self.currentBitCoin + value

	def __str__(self):
		return "{" +  \
				"\n\t" + "hash : " + str(self.hash) +  \
				"\n\t" + "miningCount : " + str(self.miningCount) + \
				"\n\t" + "tx_mining : " + getStringFromTx(self.tx_mining) + \
				"\n\t" + "tx_payment : " + getStringFromTx(self.tx_payment) + \
				"\n\t" + "tx_credit : " + getStringFromTx(self.tx_credit) + \
				"\n\t" + "totBitCoinMined : " + str(self.totBitCoinMined) + \
				"\n\t" + "totDollarMined : " + str(self.totDollarMined) + \
				"\n\t" + "currentBitCoin : " + str(self.currentBitCoin) + \
				"\n}"



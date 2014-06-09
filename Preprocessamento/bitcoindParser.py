#!/usr/bin/python

from subprocess import *
import json
import pprint

from macro import *

from transaction import Transaction
from address import Address

#Macro
# def printObj(obj):
# 	pprint.pprint(vars(obj))

# def printJson(obj):
# 	print json.dumps(obj, indent=4, sort_keys=True)

# def getJSONObjFromString(json_string):
# 	return json.loads(json_string)

# def callBashCommand(cmd_with_args):
# 	return Popen(cmd_with_args, stdout=PIPE).communicate()[0]

# def getBlock(block_num):
#   hash = callBashCommand([ "bitcoind", "getblockhash", str(block_num) ])
#   block_string = callBashCommand([ "bitcoind", "getblock", hash ])
#   return getJSONObjFromString(block_string)

# def getTransactionString(block, num):
#   tx_id = block['tx'][num]
#   return getJSONTransactionFromID(tx_id)
  

# def getJSONTransactionFromID(txid):
#   raw_tx = callBashCommand([ "bitcoind", "getrawtransaction", txid ])
#   tx_string = callBashCommand([ "bitcoind", "decoderawtransaction", raw_tx[0:len(raw_tx)-1] ])
#   return tx_string
  
# def getTransaction(block, num):
#   return getJSONObjFromString( getTransactionString(block, num) )

class BitcoinParser:

	def __init__(self):
		self.minersAddress = []

	def getAllMinerFromList(self, addressesValue_sending):
		outList = []
		for address in addressesValue_sending:
			if address[0] in self.minersAddress:
				outList.append(address[0])
		return outList

	def startParsing(self, start, maxBlockNum):

		for i in range(start, start+maxBlockNum):
 			block = getBlock(i)
			tx = Transaction(block['tx'][0], block['time'])

			#I miner vengono creati solo per la tx0
			for address in tx.addressesValue_receving:
				if address[0] in self.minersAddress:
					print "Stesso minatore " + address[0]
					address.addNewMining(tx)
				else:
					print "Minatore nuovo " + address[0]
					address_obj = Address(address, tx)
					self.minersAddress.append(address_obj)
			
			
			#Le altre transazioni aggiungo informazioni
			for tx_index in range(1, len(block['tx'])):
				tx = block['tx'][tx_index]
				tx_obj = Transaction(block['tx'][0], block['time'])
				
				miners = self.getAllMinerFromList(tx_obj.addressesValue_sending)  #filtrare la lista in python

				if ( len(miners) > 0):
					for miner in miners:
						miner.addNewPayment(tx_obj)

				miners = self.getAllMinerFromList(tx_obj.addressesValue_receving) #filtrare la lista in python
				if ( len(miners) > 0):
					for miner in miners:
						miner.addNewCredit(tx_obj)
		self.save()
	#Metodo di salvataggio su file pre-db

	def save(self):
	 	fileOut = open("out.dat", "w")
		for miner in self.minersAddress:
			fileOut.write(str(miner) + "\n")
		fileOut.close()


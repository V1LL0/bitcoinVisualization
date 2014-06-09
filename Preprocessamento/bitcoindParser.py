#!/usr/bin/python

from subprocess import *
import json
import pprint

from macro import *
from transaction import Transaction
from address import Address
from bitcoinConverter import BitcoinConverter


class BitcoinParser:

	def __init__(self):
		self.minersAddress = []
		self.bitcoinToDollar = BitcoinConverter()

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
					address_obj = Address(address, tx, self.bitcoinToDollar)
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


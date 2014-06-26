#!/usr/bin/python

from subprocess import *
import json
import pprint

from macro import *
from transaction import Transaction
from address import Address
from bitcoinConverter import BitcoinConverter
from dao import Dao


def bestMinerComparator():
	def compare(x,y):
		return int(x.miningCount - y.miningCount)
	return compare

def bestEarnerMinerComparator():
	def compare(x,y):
		return int(x.totDollarMined - y.totDollarMined)
	return compare


class BitcoinParser:

	def __init__(self):
		self.bitcoinToDollar = BitcoinConverter()
		self.dao = Dao(self.bitcoinToDollar)
		self.minersAddress = self.dao.getMinersList()
		#print self.minersAddress

	def getAllMinerFromList(self, addressesValue):
		outList = []
		for address in addressesValue:
			if address[0] in self.minersAddress:
				outList.append(address[0])
		return outList

	def startParsing(self, start, maxBlockNum):

		for i in range(start, start+maxBlockNum):
			print "Leggo il blocco: "+str(i)+" | "+str(i-start+1) + "/" + str(maxBlockNum)

 			block = getBlock(i)
			tx = Transaction(block['tx'][0], block['time'])

			#I miner vengono creati solo per la tx0
			for address in tx.addressesValue_receving:
				if address[0] in self.minersAddress:
					#print "Stesso minatore " + address[0]
					address_obj = self.dao.getAddress(address[0])
					address_obj.addNewMining(tx, address[1])
					self.dao.updateAddress(address_obj, tx)
				else:
					#print "Minatore nuovo " + address[0]
					address_obj = Address(str(address[0]), self.bitcoinToDollar)
					address_obj.addNewMining(tx, address[1])
					self.minersAddress.append(address[0])
					self.dao.insertAddress(address_obj, tx)
			
			
			#Le altre transazioni aggiungono informazioni
			for tx_index in range(1, len(block['tx'])):
				try:
					tx = block['tx'][tx_index]
					tx_obj = Transaction(tx, block['time'])
				
					miners = self.getAllMinerFromList(tx_obj.addressesValue_sending)  #filtrare la lista in python
					if ( len(miners) > 0):
						#print("TX_OBJECT.SENDING: " + str(tx_obj.addressesValue_sending))
						for miner in miners:
							address_obj = self.dao.getAddress(miner)
							#print "A CI SO' ENTRATO QUA!, SENDING - aggiungo un payment a: " + address_obj._id
							address_obj.addNewPayment(tx_obj)
							self.dao.updateAddress(address_obj, tx_obj)


					miners = self.getAllMinerFromList(tx_obj.addressesValue_receving) #filtrare la lista in python
					if ( len(miners) > 0):
						#print("TX_OBJECT.RECEIVING: " + str(tx_obj.addressesValue_receving))
						for miner in miners:
							address_obj = self.dao.getAddress(miner)
							#print "A CI SO' ENTRATO QUA!, RECEIVING - aggiungo un credit a: " + address_obj._id
							address_obj.addNewCredit(tx_obj)
							self.dao.updateAddress(address_obj, tx_obj)
				except KeyError:
					#salta la transazione
					a = 0 #non fare nulla



		#self.saveMiners()
		# self.saveFile("bestMiners", self.getBestMiner())
		# self.saveFile("bestEarner", self.getBestEarner())

	# def saveMiners(self):
	#  	fileOut = open("out.dat", "w")
	# 	for miner,value in self.minersAddress_obj.items():
	# 		fileOut.write(miner + " : " + str(value) + "\n")
	# 	fileOut.close()

	# def getBestMiner(self):		
	# 	miners = self.minersAddress_obj.values() 
	# 	miners_sorted = sorted(miners, cmp=bestMinerComparator(), reverse=True)

	# 	out = {}
	# 	for miner in miners_sorted:
	# 		out[miner._id] = miner.miningCount
	# 	return out

	# def getBestEarner(self):		
	# 	miners = self.minersAddress_obj.values() 
	# 	miners_sorted = sorted(miners, cmp=bestEarnerMinerComparator(), reverse=True)

	# 	out = {}
	# 	for miner in miners_sorted:
	# 		out[miner._id] = str(miner.totDollarMined) + "$"
	# 	return out
	
	# def saveFile(self, fileName, dic):
	# 	fileOut = open(fileName, "w")
	# 	for miner,value in dic.items():
	# 		fileOut.write(str(miner) +  " : " + str(value) + "\n")
	# 	fileOut.close()

	 	


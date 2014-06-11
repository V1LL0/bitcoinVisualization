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
	'''
	def compare(x,y):
		if x.miningCount < y.miningCount:
			return -1
		elif x.miningCount < y.miningCount:
			return 1
		else:
			return 0
	'''
	def compare(x,y):
		return int(x.miningCount - y.miningCount)
	return compare

def bestEarnerMinerComparator():
	# def compare(x,y):
	# 	if x.totDollarMined < y.totDollarMined:
	# 		return -1
	# 	elif x.totDollarMined < y.totDollarMined:
	# 		return 1
	# 	else:
	# 		return 0
	def compare(x,y):
		return int(x.totDollarMined - y.totDollarMined)
	return compare


class BitcoinParser:

	def __init__(self):
		self.minersAddress = []
		self.minersAddress_obj = {}
		self.bitcoinToDollar = BitcoinConverter()
		self.dao = Dao()

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
			printObj(tx)

			#I miner vengono creati solo per la tx0
			for address in tx.addressesValue_receving:
				if address[0] in self.minersAddress:
					#print "Stesso minatore " + address[0]
					address_obj = self.minersAddress_obj[address[0]]
					address_obj.addNewMining(tx)
					self.save(address_obj)
				else:
					#print "Minatore nuovo " + address[0]
					address_obj = Address(str(address[0]), tx, self.bitcoinToDollar)
					self.minersAddress.append(address[0])
					self.save(address_obj)
					self.minersAddress_obj[address[0]] = (address_obj)
			
			
			#Le altre transazioni aggiungo informazioni
			for tx_index in range(1, len(block['tx'])):
				tx = block['tx'][tx_index]
				tx_obj = Transaction(tx, block['time'])
				
				miners = self.getAllMinerFromList(tx_obj.addressesValue_sending)  #filtrare la lista in python
				if ( len(miners) > 0):
					for miner in miners:
						address_obj = self.minersAddress_obj[miner]
						address_obj.addNewPayment(tx_obj)

				miners = self.getAllMinerFromList(tx_obj.addressesValue_receving) #filtrare la lista in python
				if ( len(miners) > 0):
					for miner in miners:
						address_obj = self.minersAddress_obj[miner]
						address_obj.addNewCredit(tx_obj)
		#self.saveMiners()
		self.saveFile("bestMiners", self.getBestMiner())
		self.saveFile("bestEarner", self.getBestEarner())

	def saveMiners(self):
	 	fileOut = open("out.dat", "w")
		for miner,value in self.minersAddress_obj.items():
			fileOut.write(miner + " : " + str(value) + "\n")
		fileOut.close()

	def getBestMiner(self):		
		miners = self.minersAddress_obj.values() 
		miners_sorted = sorted(miners, cmp=bestMinerComparator(), reverse=True)

		out = {}
		for miner in miners_sorted:
			out[miner._id] = miner.miningCount
		return out

	def getBestEarner(self):		
		miners = self.minersAddress_obj.values() 
		miners_sorted = sorted(miners, cmp=bestEarnerMinerComparator(), reverse=True)

		out = {}
		for miner in miners_sorted:
			out[miner._id] = str(miner.totDollarMined) + "$"
		return out
	
	def saveFile(self, fileName, dic):
		fileOut = open(fileName, "w")
		for miner,value in dic.items():
			fileOut.write(str(miner) +  " : " + str(value) + "\n")
		fileOut.close()

	# def getAllValues(dic):
	# 	list = []
	# 	for key,value in dic.items():
	# 		list.append(value)
	# 	return list

	def save(self, address):
	 	self.dao.insertAddress(address)


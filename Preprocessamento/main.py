#!/usr/bin/python

from bitcoindParser import BitcoinParser


# def getJSONObjFromString(json_string):
# 	return json.loads(json_string)

# def callBashCommand(cmd_with_args):
# 	return Popen(cmd_with_args, stdout=PIPE).communicate()[0]



parser = BitcoinParser()
start = 155000 
maxBlockNum = 2
parser.startParsing(start, maxBlockNum)


# for i in range(start, start+maxBlockNum):
# 	block = getBlock(i)
# 	tx = TX(block['tx'][0], block['time'])

# 	#I miner vengono creati solo per la tx0
# 	for address in tx['addresses_receving']:
# 		if address in minersAddresses:
# 			address.update(tx)
# 		else:
# 			address_obj = Address(address, tx)
# 			parser.minersAddresses.append(address_obj)
		

# 	#Le altre transazioni aggiungo informazioni
# 	for tx_index in range(1, len(tx)):
# 		tx = tx[tx_index]
# 		tx_obj = TX(tx)
		
# 		parser.minersAddress = getAllMinerFromList(tx_obj[ 'addressesValue_sending'])  #filtrare la lista in python
# 		if ( parser.minersAddress.size > 0):
# 			for miner in self.minersAddress:
# 				miner.addNewPayment(tx_obj)

# 		parser.minersAddress = getAllMinerFromList(tx_obj['addressesValue_receving']) #filtrare la lista in python
# 		if ( parser.minersAddress.size > 0):
# 			for miner in parser.minersAddress:
# 				miner.addNewCredit(tx_obj)
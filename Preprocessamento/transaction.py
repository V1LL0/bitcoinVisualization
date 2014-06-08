#! /user/bin/pyton

from subprocess import *
import json

def printJson(obj):
	print json.dumps(obj, indent=4, sort_keys=True)

def getJSONObjFromString(json_string):
	return json.loads(json_string)

def callBashCommand(cmd_with_args):
	return Popen(cmd_with_args, stdout=PIPE).communicate()[0]
  
def getJSONTransactionFromID(txid):
  raw_tx = callBashCommand([ "bitcoind", "getrawtransaction", txid ])
  tx_string = callBashCommand([ "bitcoind", "decoderawtransaction", raw_tx[0:len(raw_tx)-1] ])
  return getJSONObjFromString( tx_string )

def getTransaction(block, num):
  return getJSONObjFromString( getTransactionString(block, num) )

class Transaction:

	def __init__(self, txid, time_block):
		
		#Pre- Elaborazioni
		tx = getJSONTransactionFromID(txid)
		#printJson(tx)
		value_in = 0
		value_out = 0
		
		addressesValue_receving = [] #Coppia address_value
		for vout in tx['vout']:
			for address in vout['scriptPubKey']['addresses']:
				value_out =  value_out + vout['value']
				addressesValue_receving.append( (address, vout['value']) )

		addressesValue_sending = [] #Coppia address_value
		try:
			for vin in tx['vin']:
				index = vin['vout']
				tx_in = getJSONTransactionFromID(vin['txid'], index)
				prec_vout = tx_in['vout'][index]
				for address in prec_vout['addresses']:
					value_in = value_in + vout['value']
					addressesValue_sending.append( (address, prec_vout['value']) ) 
		except KeyError:
			#Potrebbe essere una transazione zero
			addressesValue_sending = [] #In tal caso non ha sending

		if value_in == 0:
			fee = 0
		else: 
			fee = value_in - value_out

		#Creazione effettiva dell'oggetto
		self.id = txid
		self.time = time_block
		self.fee = fee
		self.value_in = value_in
		self.value_out = value_out
		self.addressesValue_receving = addressesValue_receving
		self.addressesValue_sending = addressesValue_sending

	def __str__(self):
		return "{" +  \
				"\n\t" + "id : " + self.id +  \
				"\n\t" + "time : " + str(self.time) + \
				"\n\t" + "fee : " + str(self.fee) + \
				"\n\t" + "value_in : " + str(self.value_in) + \
				"\n\t" + "value_out : " + str(self.value_out) + \
				"\n\t" + "addressesValue_receving : " + str(self.addressesValue_receving) + \
				"\n\t" + "addressesValue_sending : " + str(self.addressesValue_sending) + \
				"\n}"

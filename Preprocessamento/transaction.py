#! /user/bin/pyton

from macro import *

class Transaction:

	def __init__(self, txid, time_block):
		
		#Pre- Elaborazioni
		#print "txid: " + txid
		tx = getJSONTransactionFromID(txid)
		value_in = 0
		value_out = 0

		addressesValue_receving = [] #Coppia address_value
		for vout in tx['vout']:
			for address in vout['scriptPubKey']['addresses']:
				value_out =  value_out + vout['value']
				addressesValue_receving.append( (str(address), vout['value']) )

		addressesValue_sending = [] #Coppia address_value
		try:
			for vin in tx['vin']:
				index = vin['vout']
				tx_in = getJSONTransactionFromID(vin['txid'])
				prec_vout = tx_in['vout'][index]
				for address in prec_vout['scriptPubKey']['addresses']:
					value_in = value_in + prec_vout['value']
					addressesValue_sending.append( (str(address), prec_vout['value']) ) 
		except KeyError:
			#Potrebbe essere una transazione zero
			addressesValue_sending = [] #In tal caso non ha sending



		#Creazione effettiva dell'oggetto
		self._id = txid
		#self.txid = txid
		self.time = time_block
		self.value_in = value_in
		self.value_out = value_out
		self.addressesValue_receving = addressesValue_receving
		self.addressesValue_sending = addressesValue_sending

	

	def __str__(self):
		return "{" +  \
				"\n\t" + "id : " + self._id +  \
				"\n\t" + "time : " + str(self.time) + \
				"\n\t" + "value_in : " + str(self.value_in) + \
				"\n\t" + "value_out : " + str(self.value_out) + \
				"\n\t" + "addressesValue_receving : " + str(self.addressesValue_receving) + \
				"\n\t" + "addressesValue_sending : " + str(self.addressesValue_sending) + \
				"\n}"

	# def __repr__(self):
	# 	return str(self)

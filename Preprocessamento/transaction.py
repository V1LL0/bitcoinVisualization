#! /user/bin/pyton

from macro import *

class Transaction:
	def __init__(self, transaction):
			self._type = "transaction"
			self._id = transaction["_id"]
			self.time = transaction["time"]
			self.value_in = transaction["value_in"]
			self.value_out = transaction["value_out"]
			self.addressesValue_receving = transaction["addressesValue_receving"]
			self.addressesValue_sending = transaction["addressesValue_sending"]



# 	def __init__(self, txid, time_block):		
# 		
# 		#Pre- Elaborazioni
# 		#print "txid: " + txid
# 		tx = getJSONTransactionFromID(txid)
# 		value_in = 0
# 		value_out = 0
# 
# 		addressesValue_receving = [] #Coppia address_value
# 		for vout in tx['vout']:
# 			try:
# 				for address in vout['scriptPubKey']['addresses']:
# 					value_out =  value_out + vout['value']
# 					addressesValue_receving.append( (str(address), vout['value']) )
# 			except KeyError:
# 				#Potrebbe essere una transazione non standard, saltala
# 				a=0
# 		
# 		addressesValue_sending = [] #Coppia address_value
# 		for vin in tx['vin']:
# 			try:
# 				index = vin['vout']
# 				tx_in = getJSONTransactionFromID(vin['txid'])
# 				prec_vout = tx_in['vout'][index]
# 				for address in prec_vout['scriptPubKey']['addresses']:
# 					value_in = value_in + prec_vout['value']
# 					addressesValue_sending.append( (str(address), prec_vout['value']) ) 
# 			except KeyError:
# 				#Potrebbe essere una transazione non standard
# 				a=0 #In tal caso saltala
# 
# 
# 
# 		#Creazione effettiva dell'oggetto
# 		self._id = txid
# 		#self.txid = txid
# 		self.time = time_block
# 		self.value_in = value_in
# 		self.value_out = value_out
# 		self.addressesValue_receving = addressesValue_receving
# 		self.addressesValue_sending = addressesValue_sending

	

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

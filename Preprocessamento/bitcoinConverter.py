import csv
import datetime



class BitcoinConverter:

	dictionary = {}

	def __init__(self):
		with open('Preprocessamento/bitcoin2dollar.csv', 'rb') as csvfile:
			reader = csv.reader(csvfile, delimiter=',')
			for row in reader:
				self.dictionary[row[0][0:10]] = row[1] #Prendo solo giorno/mese/anno

	def convertBitcoin(self, bitcoin, tx):
		timestamp = tx.time
		date = datetime.datetime.fromtimestamp(timestamp)
		date_string = date.strftime("%d/%m/%Y")
		return float(self.dictionary[date_string])
		


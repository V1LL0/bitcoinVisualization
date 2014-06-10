#!/usr/bin/python

import sys
import json
from subprocess import *


def getJSONObjFromString(json_string):
  return json.loads(json_string)

def callBashCommand(cmd_with_args):
  return Popen(cmd_with_args, stdout=PIPE).communicate()[0]

def getBlock(block_num):
  hash = callBashCommand([ "bitcoind", "getblockhash", str(block_num) ])
  block_string = callBashCommand([ "bitcoind", "getblock", hash ])
  return getJSONObjFromString(block_string)

def getTransactionString(block, num):
  tx_id = block['tx'][num]
  raw_tx = callBashCommand([ "bitcoind", "getrawtransaction", tx_id ])
  tx_string = callBashCommand([ "bitcoind", "decoderawtransaction", raw_tx[0:len(raw_tx)-1] ])
  return tx_string
  
def getTransaction(block, num):
  return getJSONObjFromString( getTransactionString(block, num) )
  
  
max_block_num = 100
  
fileOut = open("out.dat", "w")

#Per testare
for i in range(150000, 150000+max_block_num):
  block = getBlock(i)
  tx_string = getTransactionString(block, 0)
  fileOut.write(tx_string)
  try:
    tx_string = getTransactionString(block, 1)
    fileOut.write(tx_string)
  except Exception:
    print "Exception"




fileOut.close()

'''

TO GET ADDRESSES IN INPUT!!!!

txid = <relevant transaction id>
addresses = []
raw_tx = decoderawtransaction(getrawtransaction(txid))
for(input in raw_tx['vin']) {
 input_raw_tx = decoderawtransaction(getrawtransaction(input['txid']))
 addresses.push(input_raw_tx['vout'][input['vout']]['scriptPubKey']['addresses'][0])
}

'''
 

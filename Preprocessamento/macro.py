from subprocess import *
import json

def printObj(obj):
	pprint.pprint(vars(obj))

def printJson(obj):
	print json.dumps(obj, indent=4, sort_keys=True)

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
  return getJSONTransactionFromID(tx_id)
  
def getJSONTransactionFromID(txid):
  raw_tx = callBashCommand([ "bitcoind", "getrawtransaction", txid ])
  tx_string = callBashCommand([ "bitcoind", "decoderawtransaction", raw_tx[0:len(raw_tx)-1] ])
  return getJSONObjFromString( tx_string )
  
def getTransaction(block, num):
  return getJSONObjFromString( getTransactionString(block, num) )
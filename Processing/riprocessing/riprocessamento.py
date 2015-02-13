#!/usr/bin/python

import time
from dao import Dao
from bitcoinConverter import BitcoinConverter

fileName = 'riprocessamentoNextAddressToRead'

def getLastAddress():
    fileToRead = open(fileName, 'r')
    start = fileToRead.readlines()[0]
    fileToRead.close()
    return int(start)

def saveBlockNum(num):
    f = open(fileName, 'w')
    f.write(str(num))
    f.close()


def printTime(end):
    end_sec = int(end%60)
    end_min = int((end/60)%60)
    end_h = int(end/3600)
    print end_h, " hours ", end_min, " minutes ", end_sec, " seconds "



start_time = time.time()

start = getLastAddress()
print "start: "+str(start)
#start = 155000 
maxAddressNum = 210054

bitcoinToDollar=BitcoinConverter()
dao = Dao(bitcoinToDollar)
minersList=dao.getMinersList()


try:
    for i in range(start, maxAddressNum):
        try:
            addressObj = dao.getAddress(minersList[i])
            dao.db.addresses.update({"_id" : addressObj._id}, dao.encode_address(addressObj))
            print str(i)
            saveBlockNum(i)
        except IndexError:
            print str(i)
            saveBlockNum(i)
            a=0    
  
    end = int(time.time() - start_time)
    printTime(end)
    
except ValueError:
    print "Attendere qualche secondo prima di avviare."
    print "Il Demone bitcoind potrebbe non essere ancora operativo"




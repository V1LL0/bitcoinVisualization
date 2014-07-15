#!/usr/bin/python

from dao import Dao
import time
from bitcoinConverter import BitcoinConverter


fileName = 'nextAddressToReadFixing'

def getLastAddress():
    fileToRead = open(fileName, 'r')
    start = fileToRead.readlines()[0]
    fileToRead.close()
    return int(start)

def saveAddressNum(num):
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
#start = 155000
bitcoinToDollar = BitcoinConverter()
dao = Dao(bitcoinToDollar)
minersList = dao.getMinersList()

maxAddressNum = len(minersList)

try:
    for i in range(start, maxAddressNum):
        try:
            dao.updateMiningCount(minersList[i])
            print(str(i)+"scritto")
            saveAddressNum(i)
        except (IndexError, KeyError):
            print(str(i)+"NOOOOOOOOOOOOOOOOOO")
            saveAddressNum(i)

        
    end = int(time.time() - start_time)
    printTime(end)
    
except ValueError:
    print "Attendere qualche secondo prima di avviare."
    print "Il Demone bitcoind potrebbe non essere ancora operativo"





#!/usr/bin/python

from dao import Dao
import time
from bitcoinConverter import BitcoinConverter


fileName = 'nextTransactionsToRead'

def getLastTransaction():
    fileToRead = open(fileName, 'r')
    start = fileToRead.readlines()[0]
    fileToRead.close()
    return int(start)

def saveTransactionNum(num):
    f = open(fileName, 'w')
    f.write(str(num))
    f.close()


def printTime(end):
    end_sec = int(end%60)
    end_min = int((end/60)%60)
    end_h = int(end/3600)
    print end_h, " hours ", end_min, " minutes ", end_sec, " seconds "



start_time = time.time()


start = getLastTransaction()
#start = 155000
bitcoinToDollar = BitcoinConverter()
dao = Dao(bitcoinToDollar)
transactionsList = dao.getTransactionsList()

maxTransactionsNum = len(transactionsList)

try:
    for i in range(start, maxTransactionsNum):
        try:
            dao.setMinersCount(transactionsList[i])
            print(str(i)+" scritto")
            saveTransactionNum(i)
        except (IndexError, KeyError):
            print(str(i)+" NOOOOOOOOOOOOOOOOOO")
            saveTransactionNum(i)

        
    end = int(time.time() - start_time)
    printTime(end)
    
except ValueError:
    print "Attendere qualche secondo prima di avviare."
    print "Il Demone bitcoind potrebbe non essere ancora operativo"





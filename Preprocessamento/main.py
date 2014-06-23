#!/usr/bin/python

from bitcoindParser import BitcoinParser
import time

fileName = 'nextBlockToRead'

def getLastBlock():
  file = open(fileName, 'r')
  start = file.readlines()[0]
  file.close()
  return int(start)

def saveBlockNum(num):
  f = open(fileName, 'w')
  f.write(str(num))
  f.close()


def printTime(start,end):
  end_sec = int(end%60)
  end_min = int((end/60)%60)
  end_h = int(end_min/60)
  print end_h, " hours ", end_min, " minutes ", end_sec, " seconds "





start_time = time.time()

parser = BitcoinParser()
start = getLastBlock()
#start = 155000 
maxBlockNum = 50000
try:
  parser.startParsing(start, maxBlockNum)
  saveBlockNum(start+maxBlockNum)
  end = int(time.time() - start_time)
  printTime(start_time, end)
except ValueError:
  print "Attendere qualche secondo prima di avviare."
  print "Il Demone bitcoind potrebbe non essere ancora operativo"




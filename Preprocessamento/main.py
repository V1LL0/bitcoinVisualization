#!/usr/bin/python

from bitcoindParser import BitcoinParser
import time

start_time = time.time()

parser = BitcoinParser()
start = 155000 
maxBlockNum = 1 #100
try:
  parser.startParsing(start, maxBlockNum)
except ValueError:
  print "Attendere qualche secondo prima di avviare."
  print "Il Demone bitcoind potrebbe non essere ancora operativo"


end = int(time.time() - start_time)
end_sec = int(end%60)
end_min = int(end/60)
end_h = int(end_min/60)

print end_h, " hours ", end_min, " minutes ", end_sec, " seconds "

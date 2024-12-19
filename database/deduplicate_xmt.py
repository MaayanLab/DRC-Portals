import sys

xmt = {}
for line in sys.stdin:
  line_split = line.rstrip('\r\n').split('\t')
  if len(line_split)<3: continue
  term, desc, *entities = line_split
  if (term, desc) in xmt:
    print(f"WARN: {term} {desc} duplicated", 'equivalent' if xmt[(term, desc)] == entities else 'different', file=sys.stderr)
    continue
  else:
    xmt[(term, desc)] = entities
  print(term, desc, *entities, sep='\t', file=sys.stdout)

from upload_common import upload_file
from glob import glob

for f in glob("output/*"):
    filename = f.replace('output', 'database/110723')
    print(filename)
    upload_file(f, filename)
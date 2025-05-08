import sys
import shutil
from ufs.access.url import open_from_url

def stream(*, access_url: str):
  with open_from_url(access_url) as fr:
    shutil.copyfileobj(fr, sys.stdout)

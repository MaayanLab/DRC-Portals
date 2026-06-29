# https://gist.github.com/u8sand/54b07f7413e2c8771ab394aa205d1c0f
import queue
import atexit
import asyncio
import threading

def get_event_loop():
  ''' Get an active event loop or start one in another thread, stop it when exiting the program
  '''
  try:
    return asyncio.get_event_loop()
  except RuntimeError:
    def run_loop(loop):
      asyncio.set_event_loop(loop)
      loop.run_forever()
    loop = asyncio.new_event_loop()
    t = threading.Thread(target=run_loop, args=(loop,), daemon=True)
    t.start()
    asyncio.set_event_loop(loop)
    @atexit.register
    def _():
      loop.call_soon_threadsafe(loop.stop)
      t.join()
      loop.close()
    return loop

def submit_async(coro, loop=None):
  ''' Submit a coroutine to run in the event loop, returns a future
  '''
  loop = get_event_loop() if loop is None else loop
  return asyncio.run_coroutine_threadsafe(coro, loop)

async def queue_from_async(asyncgen, Q: queue.Queue):
  ''' A helper for yield_async -- submit items from an asynchronous generator to a synchronized queue
  '''
  async for item in asyncgen:
    await asyncio.to_thread(Q.put, item)
  await asyncio.to_thread(Q.put, StopAsyncIteration)

def yield_async(asyncgen, loop=None, maxsize: int = 1):
  ''' Loop through an async generator as if it's a synchronous one
  '''
  Q = queue.Queue(maxsize=maxsize)
  future = submit_async(queue_from_async(asyncgen, Q), loop=loop)
  while not future.done():
    item = Q.get()
    if item is StopAsyncIteration:
      Q.task_done()
      break
    yield item
    Q.task_done()

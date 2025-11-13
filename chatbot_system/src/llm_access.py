import asyncio


class LLMAccess:
    def __init__(self, stream_function=callable):
        self.stream_function = stream_function

    def getStreamer(self, chat_history):
        async def streamer():
            queue = asyncio.Queue()
            loop = asyncio.get_running_loop()

            def stream_function_wrapper(loop):
                for token in self.stream_function(chat_history):
                    asyncio.run_coroutine_threadsafe(queue.put(token), loop)

            asyncio.get_running_loop().run_in_executor(
                None, stream_function_wrapper, loop
            )

            while True:
                token = await queue.get()
                if token is None:
                    break
                yield token

        return streamer

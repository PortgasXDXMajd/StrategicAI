import asyncio


class BackgroundTaskRunner:
    @staticmethod
    def run_async_task(coro):
        async def safe_task():
            try:
                await coro
            except Exception as e:
                pass
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(safe_task())
            else:
                loop.run_until_complete(safe_task())
        except Exception as e:
            pass
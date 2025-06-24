import functools

def tool(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        # I had logger here then removed it and kept the decorator for future use
        result = fn(*args, **kwargs)
        return result

    return wrapper

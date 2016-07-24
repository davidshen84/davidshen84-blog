import os
from functools import wraps


def with_admin(f):
    @wraps(f)
    def func(*args, **kwargs):
        os.environ['USER_IS_ADMIN'] = '1'
        ret = f(*args, **kwargs)
        os.environ['USER_IS_ADMIN'] = '0'

        return ret
    return func

from __future__ import absolute_import

import os
from functools import wraps

from flask_restful import abort

os.environ['public_key'] = 'pk'
os.environ['debug'] = 'True'


def with_admin(f):
    @wraps(f)
    def func(*args, **kwargs):
        os.environ['USER_IS_ADMIN'] = '1'
        ret = f(*args, **kwargs)
        os.environ['USER_IS_ADMIN'] = '0'

        return ret

    return func


class DecoratorMock(object):
    def __init__(self):
        self.authorized = True
        self.published_only = None

    def __call__(self, f):
        @wraps(f)
        def func(*args, **kwargs):
            if not self.authorized:
                abort(401)
            if self.published_only is not None:
                kwargs.update({'published_only': self.published_only})
            return f(*args, **kwargs)

        return func

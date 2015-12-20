# -*- coding: utf-8-unix -*-

from flask import abort
from functools import wraps
from google.appengine.api import users
from urllib import unquote


def is_admin():
    return users.is_current_user_admin()


def login_admin(f):
    @wraps(f)
    def func(*args, **kwargs):
        if users.is_current_user_admin():
            return f(*args, **kwargs)
        else:
            abort(401)

    return func


def simple_auth(f):
    @wraps(f)
    def func(*args, **kwargs):
        kwargs["published_only"] = not users.is_current_user_admin()
        return f(*args, **kwargs)

    return func


def auto_unquote(unquotee):
    def decorated(f):
        @wraps(f)
        def func(*args, **kwargs):
            """automatically unquote argument *unquotee*
            :param kwargs:
            :param args:
            """
            if kwargs.has_key(unquotee):
                kwargs[unquotee] = unquote(kwargs[unquotee])

            return f(*args, **kwargs)

        return func

    return decorated

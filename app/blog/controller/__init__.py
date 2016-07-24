from functools import wraps
from urllib import unquote

from flask import abort
from google.appengine.api import users


def is_admin():
    return users.is_current_user_admin()


def require_admin(f):
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


def format_date(date):
    date_format = '%m-%d-%Y'
    return date.strftime(date_format)

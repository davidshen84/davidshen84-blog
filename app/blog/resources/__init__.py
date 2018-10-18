from __future__ import absolute_import

from functools import wraps

from google.appengine.api import users

from flask_restful import fields
from werkzeug.exceptions import abort


class FormattedDate(fields.Raw):
    def format(self, value):
        return format_date(value)


class UrlSafe(fields.Raw):
    def format(self, value):
        return value.urlsafe()


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


def format_date(date):
    date_format = '%m-%d-%Y'
    return date.strftime(date_format)

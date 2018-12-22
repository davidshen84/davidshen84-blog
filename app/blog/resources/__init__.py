from __future__ import absolute_import

import logging
import os
from functools import wraps

from werkzeug.exceptions import abort

import jwt
from flask_restful import fields
from flask_restful.reqparse import RequestParser
from jwt import InvalidTokenError

public_key = os.environ['public_key'].encode('ascii')


class FormattedDate(fields.Raw):
    def format(self, value):
        return format_date(value)


class UrlSafe(fields.Raw):
    def format(self, value):
        return value.urlsafe()


def authorize(required=True, **kwargs_):
    parser = RequestParser()
    parser.add_argument('Authorization', type=str, required=False, location='headers')
    options = {
        'require_nbf': True,
        'require_exp': True
    }

    def decorator(f):
        @wraps(f)
        def func(*args, **kwargs):
            reqargs = parser.parse_args()
            authorization_header = reqargs['Authorization']  # type: str
            if authorization_header is None:
                if required:
                    abort(401)
                else:
                    return f(*args, **kwargs)

            _, token = authorization_header.split(' ')

            decoded = dict()
            try:
                decoded = jwt.decode(token, public_key, algorithms='RS256', options=options, **kwargs_)
                logging.debug(decoded)
            except InvalidTokenError as e:
                if required:
                    logging.error('JWT decode error: %s', e.message)
                    abort(401)
            for k in decoded.keys():
                if k not in kwargs_.keys():
                    del decoded[k]
            kwargs.update(decoded)
            logging.debug(kwargs)

            return f(*args, **kwargs)

        return func

    return decorator


def format_date(date):
    date_format = '%m-%d-%Y'
    return date.strftime(date_format)

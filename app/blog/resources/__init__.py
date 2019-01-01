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


def authorize(required=True, **decoded_kwargs):
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

            token = ''
            try:
                scheme, token = authorization_header.split(' ')
                if scheme != 'Bearer':
                    raise ValueError(scheme)
            except ValueError:
                abort(401, 'Invalid Authorization header')

            decoded = dict()
            try:
                decoded = jwt.decode(token, public_key, algorithms='RS256', options=options, **decoded_kwargs)
            except InvalidTokenError as e:
                if required:
                    logging.error('JWT decode error: %s', e.message)
                    abort(401)

            # Delete unknown parameters from the decoded payload.
            for k in (k for k in decoded.keys() if k not in decoded_kwargs.keys()):
                del decoded[k]
            kwargs.update(decoded)

            return f(*args, **kwargs)

        return func

    return decorator


def format_date(date):
    date_format = '%m-%d-%Y'
    return date.strftime(date_format)

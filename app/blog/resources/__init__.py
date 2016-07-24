from __future__ import absolute_import

from blog.controller import format_date
from flask_restful import fields


class FormattedDate(fields.Raw):
    def format(self, value):
        return format_date(value)


class UrlSafe(fields.Raw):
    def format(self, value):
        return value.urlsafe()

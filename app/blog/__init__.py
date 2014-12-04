# coding=utf-8

import sys
import logging

sys.path.insert(0, 'blog/module')
sys.path.insert(0, 'blog/module/werkzeug.zip')
sys.path.insert(0, 'blog/module/flask.zip')

from flask import Flask
from google.appengine.ext.webapp import util
from module.route import add_app_url_rule, add_api_url_rule
from urllib import quote

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
add_app_url_rule(app)
app.debug = True

api = Flask(__name__)
add_api_url_rule(api)
api.debug = True

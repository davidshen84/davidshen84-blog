# coding=utf-8

import sys

sys.path.insert(0, 'werkzeug.zip')
sys.path.insert(0, 'flask.zip')
# sys.path.insert(0, 'bloglib.zip')

from flask import Flask
from google.appengine.ext.webapp import util
from route import add_url_rule
from urllib import quote

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote

add_url_rule(app)

if __name__ == '__main__':
  app.debug = True
  util.run_wsgi_app(app)


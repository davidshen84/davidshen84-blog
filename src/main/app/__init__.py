# coding=utf-8

import sys

sys.path.insert(0, 'werkzeug.zip')
sys.path.insert(0, 'flask.zip')

from flask import Flask
from google.appengine.ext.webapp import util

app = Flask(__name__)

from blog import myblog, myblogadmin, myblogapi, mycommentapi

if __name__ == '__main__':
  app.debug = True
  util.run_wsgi_app(app)


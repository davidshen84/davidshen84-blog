# -*- coding: utf-8-unix -*-

import os
from google.appengine.ext import vendor

try:
    vendor.add('lib')
except:
    pass

from urllib import quote
from flask import Flask
from blog.controller.myblog import blueprint as blog
from blog.controller.myblogadmin import blueprint as blogadmin
from blog.controller.myblogapi import blueprint as blogapi
from blog.controller.mycommentapi import blueprint as blogcommentapi

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
app.debug = os.environ['debug'] == 'True'
app.register_blueprint(blog)
app.register_blueprint(blogadmin)

api = Flask(__name__)
api.debug = os.environ['debug'] == 'True'
api.register_blueprint(blogapi)
api.register_blueprint(blogcommentapi)

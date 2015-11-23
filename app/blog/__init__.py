# -*- coding: utf-8-unix -*-

from google.appengine.ext import vendor
vendor.add('lib')

from urllib import quote
from flask import Flask
from blog.module.myblog import blueprint as myblog
from blog.module.myblogadmin import myblogadmin
from blog.module.myblogapi import blueprint as myblogapi
from blog.module.mycommentapi import mycommentapi


app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
app.debug = True
app.register_blueprint(myblog)
app.register_blueprint(myblogadmin)

api = Flask(__name__)
api.debug = True
api.register_blueprint(myblogapi)
api.register_blueprint(mycommentapi)

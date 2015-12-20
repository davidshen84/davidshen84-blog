# -*- coding: utf-8-unix -*-

from google.appengine.ext import vendor
vendor.add('lib')

if True:
    from urllib import quote
    from flask import Flask
    from blog.controller.myblog import blueprint as myblog
    from blog.controller.myblogadmin import blueprint
    from blog.controller.myblogapi import blueprint as myblogapi
    from blog.controller.mycommentapi import mycommentapi


debug_flag = True

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
app.debug = debug_flag
app.register_blueprint(myblog)
app.register_blueprint(blueprint)

api = Flask(__name__)
api.debug = debug_flag
api.register_blueprint(myblogapi)
api.register_blueprint(mycommentapi)

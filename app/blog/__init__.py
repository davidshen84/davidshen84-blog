# -*- coding: utf-8-unix -*-

from google.appengine.ext import vendor
vendor.add('lib')

if True:
    from urllib import quote
    from flask import Flask
    from blog.controller.myblog import blueprint as blog
    from blog.controller.myblogadmin import blueprint as blogadmin
    from blog.controller.myblogapi import blueprint as blogapi
    from blog.controller.mycommentapi import blueprint as blogcommentapi


debug_flag = True

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
app.debug = debug_flag
app.register_blueprint(blog)
app.register_blueprint(blogadmin)

api = Flask(__name__)
api.debug = debug_flag
api.register_blueprint(blogapi)
api.register_blueprint(blogcommentapi)

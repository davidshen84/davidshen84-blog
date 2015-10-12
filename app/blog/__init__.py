# -*- coding: utf-8-unix -*-

import sys
import logging

sys.path.insert(0, 'lib')
# sys.path.insert(0, 'blog/module')
# sys.path.insert(0, 'blog/module/werkzeug.zip')
# sys.path.insert(0, 'blog/module/flask.zip')

from urllib import quote

from flask import Flask

from blog.module.myblog import blueprint as myblog
from blog.module.myblogadmin import myblogadmin
from blog.module.myblogapi import myblogapi
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

import os

from google.appengine.ext import vendor

# noinspection PyBroadException
try:
    vendor.add('lib')
except:
    pass

from urllib import quote
from flask import Flask
from blog.controller import myblog, myblogadmin, myblogapi, mycommentapi
from resources import bloglist, blog, comment

app = Flask(__name__)
app.jinja_env.filters['urlencode'] = quote
app.debug = os.environ['debug'] == 'True'
app.register_blueprint(myblog.blueprint)
app.register_blueprint(myblogadmin.blueprint)

api = Flask(__name__)
api.debug = os.environ['debug'] == 'True'
api.register_blueprint(myblogapi.blueprint)
api.register_blueprint(mycommentapi.blueprint)

resource = Flask(__name__)
resource.debug = os.environ['debug'] == 'True'
resource.register_blueprint(bloglist.blueprint)
resource.register_blueprint(blog.blueprint)
resource.register_blueprint(comment.blueprint)

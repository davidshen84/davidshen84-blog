import os

from google.appengine.ext import vendor

# noinspection PyBroadException
try:
    vendor.add('lib')
except:
    pass

from flask import Flask
from resources import bloglist, blog, comment

resource = Flask(__name__)
resource.debug = os.environ['debug'] == 'True'
resource.register_blueprint(bloglist.blueprint)
resource.register_blueprint(blog.blueprint)
resource.register_blueprint(comment.blueprint)

from __future__ import absolute_import

import os

from flask import Flask

from blog.resources import bloglist, blog, comment, jwtapi

app = Flask(__name__)
app.debug = os.environ['debug'] == 'True'
app.register_blueprint(bloglist.blueprint)
app.register_blueprint(blog.blueprint)
app.register_blueprint(comment.blueprint)
app.register_blueprint(jwtapi.blueprint)

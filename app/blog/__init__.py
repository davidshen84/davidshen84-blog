from __future__ import absolute_import

import os

from flask import Flask

from blog.resources import bloglist, blog, comment, jwtapi

resource = Flask(__name__)
resource.debug = os.environ['debug'] == 'True'
resource.register_blueprint(bloglist.blueprint)
resource.register_blueprint(blog.blueprint)
resource.register_blueprint(comment.blueprint)
resource.register_blueprint(jwtapi.blueprint)

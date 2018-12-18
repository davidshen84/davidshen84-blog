from __future__ import absolute_import

import os, logging

from flask import Flask
from blog.resources import bloglist, blog, comment

resource = Flask(__name__)
resource.debug = os.environ['debug'] == 'True'
logging.info(resource.debug)
resource.register_blueprint(bloglist.blueprint)
resource.register_blueprint(blog.blueprint)
resource.register_blueprint(comment.blueprint)


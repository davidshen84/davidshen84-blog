# coding=utf-8

import sys

sys.path.insert(0, 'werkzeug.zip')
sys.path.insert(0, 'flask.zip')
sys.path.insert(0, 'markdown.zip')

from google.appengine.ext.webapp import util
import myblog, myblogadmin, myblogapi

if __name__ == '__main__':
  mods = [ myblogapi, myblogadmin, myblog ]
  for m in mods:
    m.app.debug = True
    util.run_wsgi_app(m.app)


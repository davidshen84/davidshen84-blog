# coding=utf-8

import sys

sys.path.insert(0, 'werkzeug.zip')
sys.path.insert(0, 'flask.zip')

from google.appengine.ext.webapp import util
import myblog, myblogadmin, myblogapi, mycommentapi

main = myblog.app
blogapi = myblogapi.app
commentapi = mycommentapi.app

if __name__ == '__main__':
  for app in [ main, blogapi, commentapi ]:
    app.debug = True
    util.run_wsgi_app(app)


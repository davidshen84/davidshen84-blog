# coding = utf-8

import unittest2 as unittest

# set up environment
import sys
import os

if len(sys.argv) > 1:
  gaesdk_path = sys.argv[1]

  sys.path.insert(0, gaesdk_path)
  sys.path.insert(0, '../../')
else:
  print 'gae sdk is required'
  sys.exit(-1)

import dev_appserver
dev_appserver.fix_sys_path()

# real test code
from blog import mycommentapi
from blog.bloglib import Blog, BlogComment
from datetime import datetime
from google.appengine.api import users
from google.appengine.ext import testbed
import json


class MyCommentApiTestCase(unittest.TestCase):

  def setUp(self):
    # First, create an instance of the Testbed class.
    self.testbed = testbed.Testbed()
    # Then activate the testbed, which prepares the service stubs for use.
    self.testbed.activate()
    # Next, declare which service stubs you want to use.
    self.testbed.init_datastore_v3_stub()
    self.testbed.init_user_stub()

    self.app = mycommentapi.app.test_client()
    self.base = mycommentapi.route_base

    self.blogkey1 = Blog.create('test1', 'content 1', published=True)

  def tearDown(self):
    self.testbed.deactivate()

  def testCreate(self):
    r = self.app.post(
      self.base + 'sync/test1',
      data=json.dumps({
        'screenname': 'user1',
        'email': 'a@b.c',
        'comment': 'comment'
      }),
      content_type='application/json'
    )
    
    self.assertEqual(200, r.status_code)
    comments_count = reduce(lambda n, c: n+1, Blog.get_by_key_name('test1').comments, 0)
    self.assertEqual(1, comments_count)

  def testDestroy(self):
    id = BlogComment.create(self.blogkey1, 'user1', 'a@b.c', 'comments').id()
    comments_count = reduce(lambda n, c: n+1, Blog.get_by_key_name('test1').comments, 0)
    self.assertEqual(1, comments_count)

    # use admin account
    os.environ['USER_IS_ADMIN'] = '1'
    r = self.app.delete(self.base + 'sync/%d' % (id))
    self.assertEqual(200, r.status_code)
    comments_count = reduce(lambda n, c: n+1, Blog.get_by_key_name('test1').comments, 0)
    self.assertEqual(0, comments_count)

  def testCollection(self):
    BlogComment.create(self.blogkey1, 'user1', 'a@b.c', 'comments')
    r = self.app.get(self.base + 'sync/title=%s' % ('test1'))
    self.assertEqual(200, r.status_code)
    self.assertEqual(1, len(json.loads(r.data)))

if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(MyCommentApiTestCase)
  unittest.TextTestRunner().run(suite)

# coding = utf-8

import unittest2 as unittest

# set up environment
import sys
import os

if len(sys.argv) > 1:
  gaesdk_path = sys.argv[1]

  sys.path.insert(0, gaesdk_path)
  sys.path.insert(0, '../src')
else:
  print 'gae sdk is required'
  sys.exit(-1)

import dev_appserver
dev_appserver.fix_sys_path()

# real test code
from bloglib import Blog, BlogComment
from datetime import datetime, date
from google.appengine.ext import testbed

class BlogCommentTestCase(unittest.TestCase):

  def setUp(self):
    # First, create an instance of the Testbed class.
    self.testbed = testbed.Testbed()
    # Then activate the testbed, which prepares the service stubs for use.
    self.testbed.activate()
    # Next, declare which service stubs you want to use.
    self.testbed.init_datastore_v3_stub()

    self.title1 = 'test title1'
    self.content1 = 'test content1'
    self.tags1 = [ 'tag11', 'tag12' ]

    self.title2 = 'test title2'
    self.content2 = 'test content2'
    self.tags2 = [ 'tag21', 'tag22' ]

    Blog.create('test', 'test content')
    self.blog = Blog.getByTitle('test', publishedOnly=False)
    self.blog_key = self.blog.key()

  def tearDown(self):
    self.testbed.deactivate()

  def testCreate(self):
    comment = BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment")

    self.assertIsNotNone(comment)

  def testGetComments(self):
    BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment1")
    BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment2")

    comments = BlogComment.getComments(self.blog_key)

    self.assertIsNotNone(comments)
    self.assertEqual(reduce(lambda x, y: x+1, comments, 0), 2)

  def testDestroy(self):
    BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment1")
    BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment2")

    commentId = BlogComment.getComments(self.blog_key).get().key().id()
    BlogComment.destroy(commentId)
    comments = BlogComment.getComments(self.blog_key)
    self.assertEqual(reduce(lambda x, y: x+1, comments, 0), 1)    

if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(BlogCommentTestCase)
  unittest.TextTestRunner().run(suite)

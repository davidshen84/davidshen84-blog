# -*- coding: utf-8-unix -*-

import os

import unittest2 as unittest

try:
    if 'GAE_SDK' in os.environ:
        sys.path.insert(0, os.environ['GAE_SDK'])

    import dev_appserver

    dev_appserver.fix_sys_path()
except ImportError:
    dev_appserver = None
    print 'gae sdk is required'
    sys.exit(-1)

from google.appengine.ext import testbed
from blog.model.blog import Blog
from blog.model.blogcomment import BlogComment


class BlogCommentTestCase(unittest.TestCase):
    def setUp(self):
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

        self.title1 = 'test title1'
        self.content1 = 'test content1'
        self.tags1 = ['tag11', 'tag12']

        self.blog_key = Blog.create(self.title1, self.content1)
        self.blog = self.blog_key.get()

    def tearDown(self):
        self.testbed.deactivate()

    def testCreate(self):
        comment = BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment")

        self.assertIsNotNone(comment)

    def testGetComments(self):
        BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment1")
        BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment2")

        comments = BlogComment.get_comments(self.blog_key)

        self.assertIsNotNone(comments)
        self.assertEqual(reduce(lambda x, y: x + 1, comments, 0), 2)

    def testDestroy(self):
        BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment1")
        comment_key = BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment2")

        BlogComment.destroy(comment_key.urlsafe())
        comments = BlogComment.get_comments(self.blog_key).fetch()
        self.assertEqual(len(comments), 1)


if __name__ == '__main__':
    import sys

    suite = unittest.TestLoader().loadTestsFromTestCase(BlogCommentTestCase)
    # suite = unittest.TestLoader().loadTestsFromName('testcomment.BlogCommentTestCase.testDestroy')
    result = unittest.TextTestRunner().run(suite)
    sys.exit(len(result.failures))

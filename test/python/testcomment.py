# -*- coding: utf-8-unix -*-

import unittest2 as unittest
from google.appengine.ext import testbed

from blog.module.model.blog import Blog
from blog.module.model.blogcomment import BlogComment


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

        self.title2 = 'test title2'
        self.content2 = 'test content2'
        self.tags2 = ['tag21', 'tag22']

        Blog.create('test', 'test content')
        self.blog = Blog.get_by_title('test', published_only=False)
        self.blog_key = self.blog.key

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
        self.assertEqual(reduce(lambda x, y: x + 1, comments, 0), 2)

    def testDestroy(self):
        comment_key = BlogComment.create(self.blog_key, "test user", "test@test.com", "test comment2")

        BlogComment.destroy(comment_key.urlsafe())
        comments = BlogComment.getComments(self.blog_key).fetch()
        self.assertEqual(len(comments), 1)


if __name__ == '__main__':
    import sys

    suite = unittest.TestLoader().loadTestsFromTestCase(BlogCommentTestCase)
    # suite = unittest.TestLoader().loadTestsFromName('testcomment.BlogCommentTestCase.testDestroy')
    result = unittest.TextTestRunner().run(suite)
    sys.exit(len(result.failures))

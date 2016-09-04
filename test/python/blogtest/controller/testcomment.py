# -*- coding: utf-8-unix -*-

from __future__ import absolute_import

import unittest2 as unittest

from google.appengine.ext import testbed
from blog.model.blog import Blog
from blog.model import Comment


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
        comment = Comment.create(self.blog_key, "test user", "test@test.com", "test comment")

        self.assertIsNotNone(comment)

    def testGetComments(self):
        Comment.create(self.blog_key, "test user", "test@test.com", "test comment1")
        Comment.create(self.blog_key, "test user", "test@test.com", "test comment2")

        comments = Comment.get_comments(self.blog_key)

        self.assertIsNotNone(comments)
        self.assertEqual(reduce(lambda x, y: x + 1, comments, 0), 2)

    def testDestroy(self):
        Comment.create(self.blog_key, "test user", "test@test.com", "test comment1")
        comment_key = Comment.create(self.blog_key, "test user", "test@test.com", "test comment2")

        Comment.delete(comment_key.urlsafe())
        comments = Comment.get_comments(self.blog_key).fetch()
        self.assertEqual(len(comments), 1)

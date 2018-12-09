from __future__ import absolute_import, print_function

import json

import unittest2 as unittest
from google.appengine.ext.testbed import Testbed

from blog import resource
from blog.model import Blog, Comment
from blogtest.resources import with_admin


class TestComment(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestComment, self).__init__(*args, **kwargs)

        self.testbed = Testbed()
        self.client = resource.test_client()

    def setUp(self):
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

    def tearDown(self):
        self.testbed.deactivate()

    def testGet(self):
        blog_key = Blog.create('title', 'content', published=True)
        Comment.create(blog_key, screen_name='name', email='email', comment='comment')

        r = self.client.get('/blog/resources/comments/' + blog_key.urlsafe())
        self.assertEqual(200, r.status_code)

        comments = json.loads(r.data)
        self.assertIsNotNone(comments)
        self.assertEqual(1, len(comments))

    def testGet_empty(self):
        blog_key = Blog.create('title', 'content', published=True)

        r = self.client.get('/blog/resources/comments/' + blog_key.urlsafe())
        self.assertEqual(200, r.status_code)

        comments = json.loads(r.data)
        self.assertIsNotNone(comments)
        self.assertEqual(0, len(comments))

    def testPost(self):
        blog_key = Blog.create('title', 'content', published=True)

        r = self.client.post('/blog/resources/comments/' + blog_key.urlsafe(),
                             data=json.dumps({
                                 'screen_name': 'name',
                                 'email': 'email@test.com',
                                 'comment': 'comment'
                             }),
                             content_type='application/json')

        self.assertEqual(201, r.status_code)
        comment = Comment.query(ancestor=blog_key).get()
        self.assertIsNotNone(comment)
        self.assertEqual('name', comment.screen_name)

    def testPost_500(self):
        blog_key = Blog.create('title', 'content', published=True)

        r = self.client.post('/blog/resources/comments/' + blog_key.urlsafe(),
                             data=json.dumps({
                                 'screen_name': 'name',
                                 'email': 'email_bad',
                                 'comment': 'comment'
                             }),
                             content_type='application/json')

        self.assertEqual(500, r.status_code)
        error = json.loads(r.data)
        self.assertIsNotNone(error['email'])

    def testPost_404(self):
        r = self.client.post('/blog/resources/comments/abc',
                             data=json.dumps({
                                 'screen_name': 'name',
                                 'email': 'email@test.com',
                                 'comment': 'comment'
                             }),
                             content_type='application/json')

        self.assertEqual(404, r.status_code)

    @with_admin
    def testDelete(self):
        blog_key = Blog.create('title', 'content', published=True)
        comment_key = Comment.create(blog_key, screen_name='name', email='email', comment='comment')

        r = self.client.delete('/blog/resources/comments/' + comment_key.urlsafe())
        self.assertEqual(200, r.status_code)
        self.assertIsNone(comment_key.get())

    @with_admin
    def testDelete_non_exist(self):
        r = self.client.delete('/blog/resources/comments/abc')
        self.assertEqual(200, r.status_code)

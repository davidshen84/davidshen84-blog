from __future__ import absolute_import, print_function

import json

import unittest2 as unittest
from google.appengine.ext.testbed import Testbed

from blog import resource
from blog.model import Blog
from blogtest.resources import with_admin


class TestBlogs(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(unittest.TestCase, self).__init__(*args, **kwargs)

        self.testbed = Testbed()
        self.client = resource.test_client()

    def setUp(self):
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

    def tearDown(self):
        self.testbed.deactivate()

    @with_admin
    def testGetByUrlSafe_admin(self):
        key = Blog.create('test', 'content', tags=['666', 'aaa'])
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        self.assertEqual(200, r.status_code)
        blog = json.loads(r.data)
        self.assertEqual('test', blog['title'])
        self.assertEqual('content', blog['content'])
        self.assertItemsEqual(['666', 'aaa'], blog['tags'])

    def testGetByUrlSafe_not_admin(self):
        key = Blog.create('test', 'content', published=True)
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        self.assertEqual(200, r.status_code)
        blog = json.loads(r.data)
        self.assertEqual('test', blog['title'])
        self.assertEqual('content', blog['content'])

    def testGetByUrlSafe_not_admin_404(self):
        key = Blog.create('test', 'content')
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        self.assertEqual(404, r.status_code)

    @with_admin
    def testPostBlog(self):
        create_title = 'test create title'
        r = self.client.post('/blog/resources/blogs/123',
                             data=json.dumps({
                                 'title': create_title,
                                 'content': 'content',
                                 'tags': ['t1', 't2']
                             }),
                             content_type='application/json')

        self.assertEqual(201, r.status_code)

        data = json.loads(r.data)
        self.assertIsNotNone(data['urlsafe'])
        self.assertIsNotNone(data['message'])

        blog = Blog.get_by_urlsafe(data['urlsafe'], published_only=False)
        self.assertIsNotNone(blog)
        self.assertEqual(create_title, blog.title)
        self.assertEqual('content', blog.content)

    @with_admin
    def testPutBlog(self):
        key = Blog.create('title', 'content')
        urlsafe = key.urlsafe()

        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'title': 'new title',
                                'content': 'new content',
                                'tags': ['new tag']
                            }),
                            content_type='application/json')
        self.assertEqual(200, r.status_code)

        blog = Blog.get_by_urlsafe(urlsafe, False)
        self.assertEqual('new content', blog.content)
        self.assertItemsEqual(['new tag'], blog.tags)

    @with_admin
    def testPutBlog_publish(self):
        key = Blog.create('title', 'content')
        urlsafe = key.urlsafe()

        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'published': True
                            }),
                            content_type='application/json')
        self.assertEqual(200, r.status_code)
        blog = Blog.get_by_urlsafe(urlsafe, False)
        self.assertTrue(blog.published)

    @with_admin
    def testPutBlog_unpublish(self):
        key = Blog.create('title', 'content', published=True)
        urlsafe = key.urlsafe()

        self.assertTrue(key.get().published)
        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'published': False
                            }),
                            content_type='application/json')
        self.assertEqual(200, r.status_code)
        blog = Blog.get_by_urlsafe(urlsafe, False)
        self.assertFalse(blog.published)

    @with_admin
    def testDeleteBlog(self):
        key = Blog.create('delete me', 'bad content')
        urlsafe = key.urlsafe()

        r = self.client.delete('/blog/resources/blogs/' + urlsafe)
        self.assertEqual(200, r.status_code)
        blog = Blog.get_by_urlsafe(urlsafe)
        self.assertIsNone(blog)

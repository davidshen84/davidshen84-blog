from __future__ import absolute_import, print_function

import json

import unittest2 as unittest
from google.appengine.ext.testbed import Testbed

from blog import resource
from blog.model import Blog
from blogtest.resources import with_admin


class TestBlogList(unittest.TestCase):
    def __init__(self, *args, **kwargs):
        super(TestBlogList, self).__init__(*args, **kwargs)

        self.testbed = Testbed()
        self.client = resource.test_client()

    def setUp(self):
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

    def tearDown(self):
        self.testbed.deactivate()

    def testQuery(self):
        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=False)

        r = self.client.get('/blog/resources/blogs')
        self.assertEqual(200, r.status_code)
        blog_list = json.loads(r.data)
        self.assertEqual(1, len(blog_list))

    @with_admin
    def testQuery_admin(self):
        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=False)

        r = self.client.get('/blog/resources/blogs')
        self.assertEqual(200, r.status_code)
        blog_list = json.loads(r.data)
        self.assertEqual(2, len(blog_list))

    def testQuery_with_query(self):
        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=True)

        r = self.client.get('/blog/resources/blogs?query=1')
        self.assertEqual(200, r.status_code)
        blog_list = json.loads(r.data)
        self.assertEqual(1, len(blog_list))

        blog = blog_list[0]
        self.assertEqual('title1', blog['title'])

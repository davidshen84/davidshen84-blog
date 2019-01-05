from __future__ import absolute_import

import json

from google.appengine.ext.testbed import Testbed
from mock import patch

from blog.model import Blog
from test.blog.resources import DecoratorMock


class TestBlogList(object):
    authorize_patcher = None

    @classmethod
    def setup_class(cls):
        cls.decorator_mock = DecoratorMock()
        cls.authorize_patcher = patch('blog.resources.authorize')
        cls.authorize_mock = cls.authorize_patcher.start()
        cls.authorize_mock.return_value = cls.decorator_mock

        # Imports the module after it has been patched.
        from blog.resource import app
        cls.client = app.test_client()

    @classmethod
    def teardown_class(cls):
        cls.authorize_patcher.stop()

    def setup_method(self):
        self.testbed = Testbed()
        self.testbed.activate()
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_memcache_stub()

    def teardown_method(self):
        self.testbed.deactivate()

    def test_query_non_admin(self):
        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=False)

        r = self.client.get('/blog/resources/blogs')
        assert r.status_code == 200
        blog_list = json.loads(r.data)
        assert len(blog_list) == 1

    def test_query_admin(self):
        self.decorator_mock.published_only = False
        self.decorator_mock.authorized = True

        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=False)

        r = self.client.get('/blog/resources/blogs')
        assert r.status_code == 200
        blog_list = json.loads(r.data)
        assert len(blog_list) == 2

    def test_query_with_query(self):
        Blog.create('title1', 'content', published=True)
        Blog.create('title2', 'content', published=True)

        r = self.client.get('/blog/resources/blogs?query=1')
        assert r.status_code == 200
        blog_list = json.loads(r.data)
        assert len(blog_list) == 1

        blog = blog_list[0]
        assert blog['title'] == 'title1'

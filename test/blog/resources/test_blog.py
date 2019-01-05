from __future__ import absolute_import

import json

from google.appengine.ext.testbed import Testbed
from mock import patch

from blog.model import Blog
from test.blog.resources import DecoratorMock


class TestBlogResource(object):
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

    def test_get_by_urlsafe_admin(self):
        self.decorator_mock.published_only = False
        key = Blog.create('test', 'content', tags=['666', 'aaa'])
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        assert r.status_code == 200
        blog = json.loads(r.data)
        assert blog['title'] == 'test'
        assert blog['content'] == 'content'
        assert blog['tags'] == ['666', 'aaa']

    def test_get_by_urlsafe_not_admin(self):
        self.decorator_mock.published_only = True
        key = Blog.create('test', 'content', published=True)
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        assert r.status_code == 200
        blog = json.loads(r.data)
        assert blog['title'] == 'test'
        assert blog['content'] == 'content'

    def test_get_by_urlsafe_not_admin_404(self):
        self.decorator_mock.published_only = True
        key = Blog.create('test', 'content')
        r = self.client.get('/blog/resources/blogs/' + key.urlsafe())

        assert r.status_code == 404

    def test_post_blog(self):
        self.decorator_mock.published_only = None
        self.decorator_mock.authorized = True

        create_title = 'test create title'
        r = self.client.post('/blog/resources/blogs/',
                             data=json.dumps({
                                 'title': create_title,
                                 'content': 'content',
                                 'tags': ['t1', 't2']
                             }),
                             content_type='application/json')

        assert r.status_code == 201

        data = json.loads(r.data)
        assert data['urlsafe'] is not None
        assert data['message'] is not None

        blog = Blog.get_by_urlsafe(data['urlsafe'], published_only=False)
        assert blog is not None
        assert blog.title == create_title
        assert blog.content == 'content'

    def test_put_blog(self):
        self.decorator_mock.published_only = None
        self.decorator_mock.authorized = True

        key = Blog.create('title', 'content')
        urlsafe = key.urlsafe()

        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'title': 'new title',
                                'content': 'new content',
                                'tags': ['new tag']
                            }),
                            content_type='application/json')
        assert r.status_code == 200

        blog = Blog.get_by_urlsafe(urlsafe, False)
        assert blog.content == 'new content'
        assert blog.tags == ['new tag']

    def test_put_blog_publish(self):
        self.decorator_mock.published_only = None
        self.decorator_mock.authorized = True

        key = Blog.create('title', 'content')
        urlsafe = key.urlsafe()

        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'published': True
                            }),
                            content_type='application/json')
        assert r.status_code == 200
        blog = Blog.get_by_urlsafe(urlsafe, False)
        assert blog.published

    def test_put_blog_unpublish(self):
        self.decorator_mock.published_only = None
        self.decorator_mock.authorized = True

        key = Blog.create('title', 'content', published=True)
        urlsafe = key.urlsafe()

        assert key.get().published
        r = self.client.put('/blog/resources/blogs/' + urlsafe,
                            data=json.dumps({
                                'published': False
                            }),
                            content_type='application/json')
        assert r.status_code == 200
        blog = Blog.get_by_urlsafe(urlsafe, False)
        assert not blog.published

    def test_delete_blog(self):
        self.decorator_mock.published_only = None
        self.decorator_mock.authorized = True

        key = Blog.create('delete me', 'bad content')
        urlsafe = key.urlsafe()

        r = self.client.delete('/blog/resources/blogs/' + urlsafe)
        assert r.status_code == 200
        blog = Blog.get_by_urlsafe(urlsafe)
        assert blog is None

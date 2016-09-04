# -*- coding: utf-8-unix -*-

import unittest2 as unittest

# set up environment
import os
import json

from google.appengine.ext import testbed

from datetime import datetime
from blog import api
from blog.model.blog import Blog


class MyBlogApiTestCase(unittest.TestCase):
    def setUp(self):
        # First, create an instance of the Testbed class.
        self.testbed = testbed.Testbed()
        # Then activate the testbed, which prepares the service stubs for use.
        self.testbed.activate()
        # Next, declare which service stubs you want to use.
        self.testbed.init_datastore_v3_stub()
        self.testbed.init_user_stub()
        self.testbed.init_memcache_stub()

        self.api = api.test_client()
        self.base = '/blog/api/'

        self.blog1 = Blog.create('test1', 'content 1', published=True)
        self.blog2 = Blog.create('test2', 'content 2', published=False)

        # admin
        os.environ['USER_IS_ADMIN'] = '1'

    def tearDown(self):
        self.testbed.deactivate()

    def testFetch404(self):
        r = self.api.get(self.base + 'sync/nosuchthing')
        self.assertEqual(404, r.status_code)

    def testFetch(self):
        r = self.api.get(self.base + 'sync/' + self.blog1.urlsafe())
        self.assertEqual(200, r.status_code)
        try:
            json_data = json.loads(r.data)
            self.assertIsNotNone(json_data)
        except:
            self.fail()

    def testCreate(self):
        title = 'test title'
        r = self.api.post(self.base + 'sync',
                          data=json.dumps({
                              'title': title,
                              'content': 'test content',
                              'tags': ['tag1', 'tag2']
                          }),
                          content_type='application/json')
        self.assertEqual(200, r.status_code)
        self.assertIsNotNone(Blog.get_by_id(title))

    def testCreate_bad_format(self):
        r = self.api.post(self.base + 'sync', data='bad data')
        self.assertEqual(500, r.status_code)

    def testPut(self):
        content = 'updated content'
        r = self.api.put(self.base + 'sync/' + self.blog1.urlsafe(),
                         data=json.dumps({
                             'content': content,
                             'tags': ['test', 'tags']
                         }),
                         content_type='application/json')
        self.assertEqual(200, r.status_code)
        self.assertEqual(content, Blog.get_by_id('test1').content)

    def testPut_bad_format(self):
        r = self.api.put(self.base + 'sync/' + self.blog1.urlsafe(), data='bad data')
        self.assertEqual(500, r.status_code)

    def testDestroy(self):
        r = self.api.delete(self.base + 'sync/' + self.blog1.urlsafe())
        self.assertEqual(200, r.status_code)
        self.assertIsNone(Blog.get_by_id('test1'))

    def testPublish(self):
        self.assertEqual(False, Blog.get_by_id('test2').published)
        r = self.api.put(self.base + 'sync/' + self.blog2.urlsafe(),
                         data=json.dumps({'published': True}),
                         content_type='application/json')
        self.assertEqual(200, r.status_code)
        self.assertEqual(True, Blog.get_by_id('test2').published)

    def testPublish_not_exist(self):
        r = self.api.put(self.base + 'sync/test_not_exist',
                         data=json.dumps({'published': 'true'}),
                         content_type='application/json')
        self.assertEqual(404, r.status_code)

    def testBlogStatus(self):
        Blog.create('atest', 'test content')
        Blog.create('btest', 'test content')

        # without filter
        r = self.api.get(self.base + 'sync')
        self.assertEqual(200, r.status_code)
        data = json.loads(r.data)
        self.assertEqual(4, len(data))

        # with filter
        r = self.api.get(self.base + 'sync?f=ab')
        self.assertEqual(200, r.status_code)
        data = json.loads(r.data)
        self.assertEqual(2, len(data))

    def testArchives(self):
        now = datetime.now()
        year = str(now.year)
        month = str(now.month)
        Blog.create('atest', 'test content', published=True)

        # admim
        r = self.api.get(self.base + 'archives')
        self.assertEqual(200, r.status_code)
        data = json.loads(r.data)
        self.assertEqual(3, len(data['archives'][year][month]))

        # non admin
        os.environ['USER_IS_ADMIN'] = '0'
        r = self.api.get(self.base + 'archives')
        self.assertEqual(200, r.status_code)
        data = json.loads(r.data)
        self.assertEqual(2, len(data['archives'][year][month]))

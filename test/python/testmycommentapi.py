# -*- coding: utf-8-unix -*-

import unittest2 as unittest

# set up environment
import sys
import os
import json


try:
    if 'GAE_SDK' in os.environ:
        sys.path.insert(0, os.environ['GAE_SDK'])

    import dev_appserver

    dev_appserver.fix_sys_path()
except ImportError:
    dev_appserver = None
    print 'gae sdk is required'
    sys.exit(-1)

# real test code
from google.appengine.ext import testbed

from blog import api
from blog.model.blog import Blog
from blog.model.comment import Comment


class MyCommentApiTestCase(unittest.TestCase):
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
        self.base = '/blog/comment/api/'

        self.blog1 = Blog.create('test1', 'content 1', published=True)

    def tearDown(self):
        self.testbed.deactivate()

    def testCreate(self):
        r = self.api.post(
            self.base + 'sync/' + self.blog1.urlsafe(),
            data=json.dumps({
                'screen_name': 'user1',
                'email': 'a@b.c',
                'comment': 'comment'
            }),
            content_type='application/json'
        )

        self.assertEqual(200, r.status_code)
        blog = Blog.get_by_id('test1')
        comments = [c for c in Comment.query(ancestor=blog.key)]
        self.assertEqual(1, len(comments))
        self.assertEqual('user1', comments[0].screen_name)

    def testDestroy(self):
        urlsafe = Comment.create(self.blog1, 'user1', 'a@b.c', 'comments').urlsafe()
        blog = Blog.get_by_id('test1')
        comments = Comment.query(ancestor=blog.key)
        comments_count = reduce(lambda n, c: n + 1, comments, 0)
        self.assertEqual(1, comments_count)

        # use admin account
        os.environ['USER_IS_ADMIN'] = '1'
        r = self.api.delete('{}sync/{}'.format(self.base, urlsafe))
        self.assertEqual(200, r.status_code)
        blog = Blog.get_by_id('test1')
        comments = Comment.query(ancestor=blog.key)
        comments_count = reduce(lambda n, c: n + 1, comments, 0)
        self.assertEqual(0, comments_count)

    def testCollection(self):
        Comment.create(self.blog1, 'user1', 'a@b.c', 'comments')
        r = self.api.get(self.base + 'sync/' + self.blog1.urlsafe())
        self.assertEqual(200, r.status_code)
        comments = json.loads(r.data)
        self.assertEqual(1, len(comments))

        comment0 = comments[0]
        self.assertEqual('user1', comment0['screen_name'])
        self.assertEqual('a@b.c', comment0['email'])


if __name__ == '__main__':
    suite = unittest.TestLoader().loadTestsFromTestCase(MyCommentApiTestCase)
    # suite = unittest.TestLoader().loadTestsFromName('testmycommentapi.MyCommentApiTestCase.testCollection')
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    sys.exit(len(result.failures))

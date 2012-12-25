# coding = utf-8

import unittest2 as unittest

# set up environment
import sys
import os

if len(sys.argv) > 1:
  gaesdk_path = sys.argv[1]

  sys.path.insert(0, gaesdk_path)
  sys.path.insert(0, '../../')
else:
  print 'gae sdk is required'
  sys.exit(-1)

import dev_appserver
dev_appserver.fix_sys_path()

# real test code
from app import myblogapi
from app.bloglib import Blog, BlogComment
from datetime import datetime
from google.appengine.api import users
from google.appengine.ext import testbed
import json

class MyBlogApiTestCase(unittest.TestCase):

  def setUp(self):
    # First, create an instance of the Testbed class.
    self.testbed = testbed.Testbed()
    # Then activate the testbed, which prepares the service stubs for use.
    self.testbed.activate()
    # Next, declare which service stubs you want to use.
    self.testbed.init_datastore_v3_stub()
    self.testbed.init_user_stub()

    self.app = myblogapi.app.test_client()
    self.base = myblogapi.route_base

    self.blog1 = Blog.create('test1', 'content 1')

  def tearDown(self):
    self.testbed.deactivate()

  def testFetch404(self):
    r = self.app.get(self.base + 'sync/nosuchthing')
    self.assertEqual(404, r.status_code)

  def testFetch(self):
    r = self.app.get(self.base + 'sync/test1')
    self.assertEqual(200, r.status_code)
    try:
      jsonData = json.loads(r.data)
      self.assertIsNotNone(jsonData)
    except:
      self.assertFail()

  def testCreate(self):
    title = 'test title'
    r = self.app.post(self.base + 'sync',
      data=json.dumps({
        'title': title,
        'content': 'test content',
        'tags': ['tag1', 'tag2']
      }),
      content_type='application/json')
    self.assertEqual(200, r.status_code)
    self.assertIsNotNone(Blog.get_by_key_name(title))

  def testCreate_badFormat(self):
    r = self.app.post(self.base + 'sync', data='bad data')
    self.assertEqual(500, r.status_code)

  def testPut(self):
    content = 'updated content'
    r = self.app.put(self.base + 'sync/test1',
      data=json.dumps({
        'content': content,
        'tags': ['test', 'tags']
      }),
      content_type='application/json')
    self.assertEqual(200, r.status_code)
    self.assertEqual(content, Blog.get_by_key_name('test1').content)

  @unittest.skip('outdated')
  def testPut_notexist(self):
    r = self.app.put(self.base + 'sync/test_notexist',
      data={
        'content': 'content',
        'tags': ['test']
      })
    self.assertEqual(404, r.status_code)

  def testPut_badFormat(self):
    r = self.app.put(self.base + 'sync/test1', data='bad data')
    self.assertEqual(500, r.status_code)

  def testDestroy(self):
    r = self.app.delete(self.base + 'sync/test1')
    self.assertEqual(200, r.status_code)
    self.assertIsNone(Blog.get_by_key_name('test1'))

  @unittest.skip('outdated')
  def testPublish(self):
    self.assertEqual(False, Blog.get_by_key_name('test1').published)
    r = self.app.put(self.base + 'syncpub/test1', data={'published': 'true'})
    self.assertEqual(200, r.status_code)
    self.assertEqual(True, Blog.get_by_key_name('test1').published)

  def testPublish_new(self):
    self.assertEqual(False, Blog.get_by_key_name('test1').published)
    r = self.app.put(self.base + 'sync/test1',
      data=json.dumps({'published': True}),
      content_type='application/json')
    self.assertEqual(200, r.status_code)
    self.assertEqual(True, Blog.get_by_key_name('test1').published)

  @unittest.skip('outdated')
  def testPublish_notexist(self):
    r = self.app.put(self.base + 'syncpub/test_notexist', data={'published': 'true'})
    self.assertEqual(404, r.status_code)

  def testPublish_notexist_new(self):
    r = self.app.put(self.base + 'sync/test_notexist',
      data=json.dumps({'published': 'true'}),
      content_type='application/json')
    self.assertEqual(404, r.status_code)

  def testBlogStatus(self):
    Blog.create('atest', 'test content')
    Blog.create('btest', 'test content')

    # without filter
    r = self.app.get(self.base + 'sync')
    self.assertEqual(200, r.status_code)
    data = json.loads(r.data)
    self.assertEqual(3, len(data['blogs']))

    # with filter
    r = self.app.get(self.base + 'sync?f=ab')
    self.assertEqual(200, r.status_code)
    data = json.loads(r.data)
    self.assertEqual(2, len(data['blogs']))

  def testArchives(self):
    now = datetime.now()
    year = str(now.year)
    month = str(now.month)
    Blog.create('atest', 'test content', published=True)

    # non admin
    r = self.app.get(self.base + 'archives')
    self.assertEqual(200, r.status_code)
    data = json.loads(r.data)
    self.assertEqual(1, len(data['archives'][year][month]))

    # admim
    os.environ['USER_IS_ADMIN'] = '1'
    r = self.app.get(self.base + 'archives')
    self.assertEqual(200, r.status_code)
    data = json.loads(r.data)
    self.assertEqual(2, len(data['archives'][year][month]))

if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(MyBlogApiTestCase)
  unittest.TextTestRunner().run(suite)

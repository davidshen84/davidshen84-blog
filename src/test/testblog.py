# coding = utf-8

import unittest2 as unittest

# set up environment
import sys
import os

if len(sys.argv) > 1:
  gaesdk_path = sys.argv[1]

  sys.path.insert(0, gaesdk_path)
  sys.path.insert(0, '../src/')
else:
  print 'gae sdk is required'
  sys.exit(-1)

import dev_appserver
dev_appserver.fix_sys_path()

# real test code
from bloglib.blog import Blog
from google.appengine.ext import testbed
from datetime import datetime, date

class BlogTestCase(unittest.TestCase):

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
    self.tags1 = [ 'tag11', 'tag12' ]

    self.title2 = 'test title2'
    self.content2 = 'test content2'
    self.tags2 = [ 'tag21', 'tag22' ]

  def tearDown(self):
    self.testbed.deactivate()

  def testGetBlogByTitle(self):
    Blog.create(self.title1, self.content1)
    Blog.create(self.title1, self.content1)

    blog = Blog.getByTitle(self.title1, False)
    self.assertIsNotNone(blog)
    self.assertIsInstance(blog, Blog)

  def testPublish(self):
    key1 = Blog.create(self.title1, self.content1)
    key2 = Blog.create(self.title2, self.content2)

    Blog.update(self.title1, published=True)

    blog1 = Blog.keyForTitle(self.title1).get()
    blog2 = Blog.keyForTitle(self.title2).get()

    self.assertTrue(blog1.published)
    self.assertFalse(blog2.published)

  def testUnpublish(self):
    key1 = Blog.create(self.title1, self.content1, published=True)
    key2 = Blog.create(self.title2, self.content2, published=True)

    Blog.update(self.title1, published=False)

    blog1 = Blog.keyForTitle(self.title1).get()
    blog2 = Blog.keyForTitle(self.title2).get()

    self.assertFalse(blog1.published)
    self.assertTrue(blog2.published)

  def testGetPublishedByTags(self):
    Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1).put()
    Blog(title=self.title1 + '1' , content=self.content1, published=False, tags=self.tags1).put()
    Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2).put()
    Blog(title=self.title2 + '2', content=self.content2, published=False, tags=self.tags2).put()

    # test by giving a complete match set
    blogs = [ b for b in Blog.getByTags(self.tags1) ]
    self.assertEqual(len(blogs), 1)

    # test by giving a partial match set
    Blog(title='t3', content='c3', published=True, tags=[ self.tags1[0] ]).put()
    Blog(title='t33', content='c3', published=False, tags=[ self.tags1[0] ]).put()

    blogs = [ b for b in Blog.getByTags(self.tags1[0]) ]
    self.assertEqual(len(blogs), 2)

  def testGetAllByTags(self):
    Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1).put()
    Blog(title=self.title1 + '1' , content=self.content1, published=False, tags=self.tags1).put()
    Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2).put()
    Blog(title=self.title2 + '2', content=self.content2, published=False, tags=self.tags2).put()

    # test by giving a complete match set
    blogs = [ b for b in Blog.getByTags(self.tags1, False) ]
    self.assertEqual(len(blogs), 2)

    # test by giving a partial match set
    Blog(title='t3', content='c3', published=True, tags=[ self.tags1[0] ]).put()
    Blog(title='t33', content='c3', published=False, tags=[ self.tags1[0] ]).put()
    blogs = [ b for b in Blog.getByTags(self.tags1[0], False) ]
    self.assertEqual(len(blogs), 4)

  def testGetLatest(self):
    date1 = date(2012, 4, 1)
    date2 = date(2012, 4, 4)
    Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1, created=date1).put()
    Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2, created=date2).put()

    blog = Blog.getLatest()
    self.assertIsNotNone(blog)
    self.assertEqual(blog.created, date2)

  def testUpdate(self):
    # verify blog can be updated
    newtags = ['new', 'newnew']
    Blog.create(self.title1, self.content1, self.tags1)
    updateData = {'content': 'new', 'tags': newtags}
    # Blog.update(self.title1, content='new', tags=newtags)
    Blog.update(self.title1, **updateData)
    blog = Blog.get_by_id(self.title1)

    self.assertIsNotNone(blog)
    self.assertEqual(blog.title, self.title1)
    self.assertEqual(blog.content, 'new')
    self.assertEqual(blog.tags, newtags)
    self.assertEqual(blog.published, False)

  def testDestroy(self):
    Blog.create(self.title1, self.content1, self.tags1)
    # verify the data exists
    self.assertIsNotNone(Blog.get_by_id(self.title1))
    Blog.destroy(self.title1)
    # verify the data is destroyed
    self.assertIsNone(Blog.get_by_id(self.title1))

  def testCanCreate(self):
    Blog.create(self.title1, self.content1, self.tags1)

    self.assertIsNotNone(Blog.get_by_id(self.title1))

  def testCreateWithCorrectValue(self):
    Blog.create(self.title1, self.content1, self.tags1)

    blog = Blog.get_by_id(self.title1)
    self.assertEqual(blog.title, self.title1)
    self.assertEqual(blog.content, self.content1)
    self.assertEqual(blog.tags, self.tags1)
    self.assertFalse(blog.published)

  def testCreateKey(self):
    key = Blog.keyForTitle('test')

    self.assertEqual('Blog', key.kind())
    self.assertEqual('test', key.id())

  def testAllTitles(self):
    Blog.create(self.title1, self.content1, self.tags1)
    titles = Blog.allTitles(False)

    self.assertGreater(len(titles), 0)

  def testGetArchiveStats(self):
    Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
    Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

    stats = Blog.getArchiveStats(False)

    self.assertIsNotNone(stats[2014])
    self.assertIsNotNone(stats[2014][3])
    self.assertEqual(2, len(stats[2014][3]))

  def testGetTagStats(self):
    Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
    Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

    stats = Blog.getTagStats(False)
    self.assertIsNotNone(stats['tag11'])

  def testCanGetByUrlsafe(self):
    urlsafe = Blog.create(self.title1, self.content1).urlsafe()
    blog = Blog.getByUrlsafe(urlsafe, False)

    self.assertIsNotNone(blog)

  def testGetTagStatsReturnTupes(self):
    Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
    Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

    stats = Blog.getTagStats(False)
    tagStats = stats['tag11'][0]
    self.assertIsInstance(tagStats[2], type(()))

if __name__ == '__main__':
  suite = unittest.TestLoader().loadTestsFromTestCase(BlogTestCase)
  unittest.TextTestRunner().run(suite)
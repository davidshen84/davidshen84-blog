# -*- coding: utf-8-unix -*-

import unittest2 as unittest

from datetime import date
from google.appengine.ext import testbed
from blog.model import Blog


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
        self.tags1 = ['tag11', 'tag12']

        self.title2 = 'test title2'
        self.content2 = 'test content2'
        self.tags2 = ['tag21', 'tag22']

    def tearDown(self):
        self.testbed.deactivate()

    def testPublish(self):
        key1 = Blog.create(self.title1, self.content1)
        Blog.create(self.title2, self.content2)

        Blog.update(key1.urlsafe(), published=True)

        blog1 = Blog.key_from_title(self.title1).get()
        blog2 = Blog.key_from_title(self.title2).get()

        self.assertTrue(blog1.published)
        self.assertFalse(blog2.published)

    def testUnpublish(self):
        key1 = Blog.create(self.title1, self.content1, published=True)
        Blog.create(self.title2, self.content2, published=True)
        Blog.update(key1.urlsafe(), published=False)

        blog1 = Blog.key_from_title(self.title1).get()
        blog2 = Blog.key_from_title(self.title2).get()

        self.assertFalse(blog1.published)
        self.assertTrue(blog2.published)

    def testGetPublishedByTags(self):
        Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1).put()
        Blog(title=self.title1 + '1', content=self.content1, published=False, tags=self.tags1).put()
        Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2).put()
        Blog(title=self.title2 + '2', content=self.content2, published=False, tags=self.tags2).put()

        # test by giving a complete match set
        blogs = [b for b in Blog.get_by_tags(self.tags1)]
        self.assertEqual(len(blogs), 1)

        # test by giving a partial match set
        Blog(title='t3', content='c3', published=True, tags=[self.tags1[0]]).put()
        Blog(title='t33', content='c3', published=False, tags=[self.tags1[0]]).put()

        blogs = [b for b in Blog.get_by_tags(self.tags1[0])]
        self.assertEqual(len(blogs), 2)

    def testGetAllByTags(self):
        Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1).put()
        Blog(title=self.title1 + '1', content=self.content1, published=False, tags=self.tags1).put()
        Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2).put()
        Blog(title=self.title2 + '2', content=self.content2, published=False, tags=self.tags2).put()

        # test by giving a complete match set
        blogs = [b for b in Blog.get_by_tags(self.tags1, False)]
        self.assertEqual(len(blogs), 2)

        # test by giving a partial match set
        Blog(title='t3', content='c3', published=True, tags=[self.tags1[0]]).put()
        Blog(title='t33', content='c3', published=False, tags=[self.tags1[0]]).put()
        blogs = [b for b in Blog.get_by_tags(self.tags1[0], False)]
        self.assertEqual(len(blogs), 4)

    def testGetLatest(self):
        date1 = date(2012, 4, 1)
        date2 = date(2012, 4, 4)
        Blog(title=self.title1, content=self.content1, published=True, tags=self.tags1, created=date1).put()
        Blog(title=self.title2, content=self.content2, published=True, tags=self.tags2, created=date2).put()

        blog = Blog.get_latest()
        self.assertIsNotNone(blog)
        self.assertEqual(blog.created, date2)

    def testUpdate(self):
        # verify blog can be updated
        new_tags = ['new', 'newnew']
        blog = Blog.create(self.title1, self.content1, self.tags1)
        update_data = {'content': 'new', 'tags': new_tags}
        # Blog.update(self.title1, content='new', tags=new_tags)
        Blog.update(blog.urlsafe(), **update_data)
        blog = Blog.get_by_id(self.title1)

        self.assertIsNotNone(blog)
        self.assertEqual(blog.title, self.title1)
        self.assertEqual(blog.content, 'new')
        self.assertEqual(blog.tags, new_tags)
        self.assertEqual(blog.published, False)

    def testDestroy(self):
        blog1 = Blog.create(self.title1, self.content1, self.tags1)
        # verify the data exists
        self.assertIsNotNone(Blog.get_by_id(self.title1))
        Blog.delete(blog1.urlsafe())
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
        key = Blog.key_from_title('test')

        self.assertEqual('Blog', key.kind())
        self.assertEqual('test', key.id())

    def testAllTitles(self):
        Blog.create(self.title1, self.content1, self.tags1)
        titles = Blog.all_titles(False)

        self.assertGreater(len(titles), 0)

    def testGetArchiveStats(self):
        Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
        Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

        stats = Blog.get_archive_stats(False)

        self.assertIsNotNone(stats[2014])
        self.assertIsNotNone(stats[2014][3])
        self.assertEqual(2, len(stats[2014][3]))

    def testGetTagStats(self):
        Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
        Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

        stats = Blog.get_tag_stats(False)
        self.assertIsNotNone(stats['tag11'])

    def testCanGetByUrlsafe(self):
        urlsafe = Blog.create(self.title1, self.content1).urlsafe()
        blog = Blog.get_by_urlsafe(urlsafe, False)

        self.assertIsNotNone(blog)

    def testGetTagStatsReturnTupes(self):
        Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 3, 21))
        Blog.create(self.title2, self.content2, self.tags2, created=date(2014, 3, 21))

        stats = Blog.get_tag_stats(False)
        tag_stats = stats['tag11'][0]
        self.assertIsInstance(tag_stats[2], type(()))

    def testGetOlder(self):
        old_blog = Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 1, 1))
        new_blog = Blog.create(self.title2, self.content2, self.tags2, created=date(2015, 1, 1))

        blog = Blog.get_older(new_blog.urlsafe(), False)

        self.assertEquals(old_blog, blog.key)

    def testGetNewer(self):
        old_blog = Blog.create(self.title1, self.content1, self.tags1, created=date(2014, 1, 1))
        new_blog = Blog.create(self.title2, self.content2, self.tags2, created=date(2015, 1, 1))

        blog = Blog.get_newer(old_blog.urlsafe(), False)

        self.assertEquals(new_blog, blog.key)

    def testGetRecent(self):
        for i in range(15):
            Blog.create("{}_{}".format(self.title1, i), self.content1, self.tags1, created=date(2015, 1, i + 1),
                        published=True)

        recent_blogs = Blog.get_recent()
        latest = recent_blogs[0]
        oldest = recent_blogs[-1]

        self.assertGreater(latest.created, oldest.created)


if __name__ == '__main__':
    import sys

    suite = unittest.TestLoader().loadTestsFromTestCase(BlogTestCase)
    # suite = unittest.TestLoader().loadTestsFromName('testblog.BlogTestCase.testUpdate')
    result = unittest.TextTestRunner().run(suite)
    sys.exit(len(result.failures))
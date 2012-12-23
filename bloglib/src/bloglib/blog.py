# coding=utf-8

import logging

from google.appengine.ext import db
from datetime import date, datetime

class Blog(db.Model):
  """GAE Blog Model

  :title: blog title
  :body: blog body
  :created: the date the blog was created
  :lastmodified: the last date the blog was lastmodified
  :published: indicate if the blog is published to public
  :tags: a list of tags associated with the blog"""

  title = db.StringProperty(required=True)
  content = db.TextProperty(required=True)
  created = db.DateProperty(auto_now_add=True)
  lastmodified = db.DateTimeProperty(auto_now=True)
  published = db.BooleanProperty(default=False)
  tags = db.StringListProperty()

  @staticmethod
  def getByTitle(title, publishedOnly=True):
    """Gets the Blog entry by title

    **if multiple entries have the same title, only the 1st one will be returned.**"""

    blog = Blog.get_by_key_name(title)
    if blog and publishedOnly and not blog.published:
      blog = None

    return blog

  @staticmethod
  def create(title, content, tags=[], **kws):
    if not Blog.get_by_key_name(title):
      return Blog(key_name=title, title=title, content=content, tags=tags, **kws).put()

  @staticmethod
  def update(title, **kw):
    blog = Blog.get_by_key_name(title)
    if not blog:
      return None
    else:
      # update blog
      if kw.has_key('content'):
        blog.content = kw['content']
      if kw.has_key('tags'):
        blog.tags = kw['tags']
      if kw.has_key('published'):
        blog.published = kw['published']

      return blog.put()

  @staticmethod
  def destroy(title):
    blog = Blog.get_by_key_name(title)
    if blog:
      blog.delete()

  @staticmethod
  def allTitles(publishedOnly=True):
    q = db.Query(Blog)
    if publishedOnly:
      q.filter('published =', True)

    return [ b.title for b in q ]

  @staticmethod
  def getBlogStatus(publishedOnly=True):
    q = db.Query(Blog)
    if publishedOnly:
      q.filter('published =', True)

    return [ { 'title': b.title,
              'published': b.published,
              'lastmodified': str(b.lastmodified) } for b in q ]

  @staticmethod
  def publish(title, published=True):
    blog = Blog.get_by_key_name(title)
    if blog:
      blog.published = published
      return blog.put()

  @staticmethod
  def getLatest():
    return Blog.gql('where published=True order by lastmodified desc').get()

  @staticmethod
  def getByTags(tags, publishedOnly=True):
    """Return published blogs by tags

    tags :
      a list of strings"""

    if not type(tags) is list:
      tags = [ tags ]

    query = db.Query(Blog)
    if publishedOnly:
      query = query.filter('published = ', True)

    return sorted(set([ b.title
                        for t in tags
                        for b in query.filter('tags = ', t).order('-lastmodified') ]))

  @staticmethod
  def getArchiveStats(publishedOnly=True):
    """Count the blogs by date and put them in a Year-Month list.

    E.g.

    - 2010

      - January (2)
      - May (3)

    - 2012

      - February (3)"""

    q = db.Query(Blog)
    if publishedOnly:
      q = q.filter('published =', True)

    blogMetas = [ (b.created.year, b.created.month, b.title) for b in q ]
    def func(data, blogMetas):
      year, month, title = blogMetas
      if data.has_key(year):
        if data[year].has_key(month):
          data[year][month].append(title)
        else:
          data[year][month] = [title]
      else:
        data[year] = {}
        data[year][month] = [title]

      return data

    return reduce(func, blogMetas, {})

  @staticmethod
  def getTagStats(publishedOnly=True):
    """Returs a dictionary with below data structure:
      tag: (year, month, title)
    """

    q = db.Query(Blog)
    if publishedOnly:
      q = q.filter('published =', True)

    blogMetas = [ (b.tags, b.created.year, b.created.month, b.title) for b in q ]
    def func(data, blogMetas):
      tags, year, month, title = blogMetas
      for tag in tags:
        meta = (year, month, title)
        if data.has_key(tag):
          data[tag].append(meta)
        else:
          data[tag] = [meta]

      return data

    return reduce(func, blogMetas, {})


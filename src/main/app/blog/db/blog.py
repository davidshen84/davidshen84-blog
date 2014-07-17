# coding=utf-8

import logging

from google.appengine.ext import ndb
from google.net.proto.ProtocolBuffer import ProtocolBufferDecodeError


class Blog(ndb.Model):
  """GAE Blog Model

  :title: blog title
  :body: blog body
  :created: the date the blog was created
  :lastmodified: the last date the blog was lastmodified
  :published: indicate if the blog is published to public
  :tags: a list of tags associated with the blog"""

  title = ndb.StringProperty(required=True)
  content = ndb.TextProperty(required=True)
  created = ndb.DateProperty(auto_now_add=True)
  lastmodified = ndb.DateTimeProperty(auto_now=True)
  published = ndb.BooleanProperty(default=False)
  tags = ndb.StringProperty(repeated=True)

  @staticmethod
  def keyForTitle(title):
    return ndb.Key(Blog, title)

  @staticmethod
  def getByTitle(title, publishedOnly=True):
    """Gets the Blog entry by title

    **if multiple entries have the same title, only the 1st one will be returned.**"""

    blog = Blog.get_by_id(title)
    if blog and publishedOnly and not blog.published:
      blog = None

    return blog

  @staticmethod
  def getByUrlsafe(urlsafe, publishedOnly=True):
    try:
      blog = ndb.Key(urlsafe=urlsafe).get()
    except ProtocolBufferDecodeError, e:
      logging.warning("bad urlsafe value %s, %s" % (urlsafe, e))
      blog = None

    if blog and publishedOnly and not blog.published:
      blog = None

    return blog

  @staticmethod
  def create(title, content, tags=[], **kws):
    key = Blog.keyForTitle(title)
    if not key.get():
      return Blog(key=key,
                  title=title,
                  content=content,
                  tags=tags,
                  **kws).put()

  @staticmethod
  def update(urlsafe, **kw):
    try:
      blog = Blog.getByUrlsafe(urlsafe, False)
      # update blog
      if blog:
        if kw.has_key('content'):
          blog.content = kw['content']
        if kw.has_key('tags'):
          blog.tags = kw['tags']
        if kw.has_key('published'):
          blog.published = kw['published']

        return blog.put()
      else:
        return None

    except (ProtocolBufferDecodeError, TypeError), e:
      logging.warning("bad urlsafe value: %s, %s" % (urlsafe, e))
      return None

  @staticmethod
  def destroy(urlsafe):
    try:
      ndb.Key(urlsafe=urlsafe).delete()
    except TypeError, e:
      logging.warning("bad urlsafe value: %s, %s" % (urlsafe, e))

  @staticmethod
  def allTitles(publishedOnly=True):
    if publishedOnly:
      query = Blog.query(Blog.published == True)
    else:
      query = Blog.query()

    return query.fetch(projection=[Blog.title])

  @staticmethod
  def getBlogStatus(publishedOnly=True):
    if publishedOnly:
      query = Blog.query(Blog.published == True)
    else:
      query = Blog.query()

    return query.fetch(projection=[Blog.title, Blog.published, Blog.lastmodified])

  @staticmethod
  def publish(urlsafe):
    blog = Blog.getByUrlsafe(urlsafe, False)
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
      a list of (title, key_urlsafe)"""

    if not type(tags) is list:
      tags = [ tags ]

    if publishedOnly:
      query = Blog.query(Blog.published == True, Blog.tags.IN(tags)).order(-Blog.lastmodified)
    else:
      query = Blog.query(Blog.tags.IN(tags)).order(-Blog.lastmodified)

    return sorted(set([ (b.title, b.key.urlsafe())
                        for t in tags
                        for b in query.fetch(projection=[Blog.title]) ]))

  @staticmethod
  def getArchiveStats(publishedOnly=True):
    """Count the blogs by date and put them in a Year-Month list.

    E.g.

    - 2010

      - January (2)
      - May (3)

    - 2012

      - February (3)"""

    if publishedOnly:
      q = Blog.query(Blog.published == True)
    else:
      q = Blog.query()

    blogMetas = [ (b.created.year, b.created.month, (b.title, b.key.urlsafe())) for
                  b in q.fetch(projection=[Blog.title, Blog.created]) ]

    def func(data, blogMetas):
      year, month, tupe = blogMetas
      if data.has_key(year):
        if data[year].has_key(month):
          data[year][month].append(tupe)
        else:
          data[year][month] = [tupe]
      else:
        data[year] = {}
        data[year][month] = [tupe]

      return data

    return reduce(func, blogMetas, {})

  @staticmethod
  def getTagStats(publishedOnly=True):
    """Returs a dictionary with below data structure:
      tag: (year, month, title)
    """

    if publishedOnly:
      q = Blog.query(Blog.published == True)
    else:
      q = Blog.query()

    blogMetas = [ (b.tags, b.created.year, b.created.month, (b.title, b.key.urlsafe()))
                  for b in q.fetch(projection=[Blog.title, Blog.tags, Blog.created]) ]
    def func(data, blogMetas):
      tags, year, month, tupe = blogMetas
      for tag in tags:
        meta = (year, month, tupe)
        if data.has_key(tag):
          data[tag].append(meta)
        else:
          data[tag] = [meta]

      return data

    return reduce(func, blogMetas, {})


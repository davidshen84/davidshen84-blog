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
  def key_for_title(title):
    return ndb.Key(Blog, title)

  @staticmethod
  def get_by_title(title, published_only=True):
    """Gets the Blog entry by title

    **if multiple entries have the same title, only the 1st one will be returned.**"""

    blog = Blog.get_by_id(title)
    if blog and published_only and not blog.published:
      blog = None

    return blog

  @staticmethod
  def get_by_urlsafe(urlsafe, published_only=True):
    try:
      blog = ndb.Key(urlsafe=urlsafe).get()
    except ProtocolBufferDecodeError, e:
      logging.warning("bad urlsafe value %s, %s" % (urlsafe, e))
      blog = None

    if blog and published_only and not blog.published:
      blog = None

    return blog

  @staticmethod
  def create(title, content, tags=None, **kws):
    if not tags:
      tags = []
    key = Blog.key_for_title(title)
    if not key.get():
      return Blog(key=key,
                  title=title,
                  content=content,
                  tags=tags,
                  **kws).put()

  @staticmethod
  def update(urlsafe, **kw):
    try:
      blog = Blog.get_by_urlsafe(urlsafe, False)
      # update blog
      if blog:
        if 'content' in kw:
          blog.content = kw['content']
        if 'tags' in kw:
          blog.tags = kw['tags']
        if 'published' in kw:
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
  def all_titles(published_only=True):
    if published_only:
      query = Blog.query(Blog.published == True)
    else:
      query = Blog.query()

    return query.fetch(projection=[Blog.title])

  @staticmethod
  def get_blog_status(published_only=True):
    if published_only:
      query = Blog.query(Blog.published == True)
    else:
      query = Blog.query()

    return query.fetch(projection=[Blog.title, Blog.published, Blog.lastmodified])

  @staticmethod
  def publish(urlsafe, published):
    blog = Blog.get_by_urlsafe(urlsafe, False)
    if blog:
      blog.published = published
      return blog.put()

  @staticmethod
  def get_latest():
    return Blog.gql('where published=True order by lastmodified desc').get()

  @staticmethod
  def get_by_tags(tags, published_only=True):
    """Return published blog by tags

    tags :
      a list of (title, key_urlsafe)"""

    if not type(tags) is list:
      tags = [tags]

    if published_only:
      query = Blog.query(Blog.published == True, Blog.tags.IN(tags)).order(-Blog.lastmodified)
    else:
      query = Blog.query(Blog.tags.IN(tags)).order(-Blog.lastmodified)

    return sorted(set([(b.title, b.key.urlsafe())
                       for b in query.fetch(projection=[Blog.title])]))

  @staticmethod
  def get_archive_stats(published_only=True):
    """Count the blog by date and put them in a Year-Month list.

    E.g.

    - 2010

      - January (2)
      - May (3)

    - 2012

      - February (3)"""

    if published_only:
      q = Blog.query(Blog.published == True)
    else:
      q = Blog.query()

    blog_metas = [(b.created.year, b.created.month, (b.title, b.key.urlsafe())) for
                  b in q.fetch(projection=[Blog.title, Blog.created])]

    def func(data, blog_metas):
      year, month, meta = blog_metas
      if year in data:
        if month in data[year]:
          data[year][month].append(meta)
        else:
          data[year][month] = [meta]
      else:
        data[year] = {}
        data[year][month] = [meta]

      return data

    return reduce(func, blog_metas, {})

  @staticmethod
  def get_tag_stats(published_only=True):
    """Returns a dictionary with below data structure:
      tag: (year, month, title)
    """

    if published_only:
      q = Blog.query(Blog.published == True)
    else:
      q = Blog.query()

    blog_metas = [(b.tags, b.created.year, b.created.month, (b.title, b.key.urlsafe()))
                  for b in q.fetch(projection=[Blog.title, Blog.tags, Blog.created])]

    def func(data, blog_metas):
      tags, year, month, title_urlsafe = blog_metas
      for tag in tags:
        meta = (year, month, title_urlsafe)
        if tag in data:
          data[tag].append(meta)
        else:
          data[tag] = [meta]

      return data

    return reduce(func, blog_metas, {})

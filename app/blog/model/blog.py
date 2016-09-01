import logging

from google.appengine.ext import ndb
from google.net.proto.ProtocolBuffer import ProtocolBufferDecodeError


class Blog(ndb.Model):
    """GAE Blog Model

    :`title` (str): blog title
    :`content` (str): blog content
    :`created` (date): the date the blog was created
    :`last_modified` (datetime: the datetime the blog was last modified
    :`published` (bool): indicate if the blog is published to public
    :`tags` ([str]): a list of tags associated with the blog"""

    title = ndb.StringProperty(required=True)
    content = ndb.TextProperty(required=True)
    created = ndb.DateProperty(auto_now_add=True)
    last_modified = ndb.DateTimeProperty(auto_now=True)
    published = ndb.BooleanProperty(default=False)
    tags = ndb.StringProperty(repeated=True)

    @classmethod
    def key_from_title(cls, title):
        return ndb.Key(cls, title)

    @classmethod
    def get_by_urlsafe(cls, urlsafe, published_only=True):
        blog = None

        try:
            blog_key = ndb.Key(urlsafe=urlsafe)
            if blog_key is not None:
                blog = blog_key.get()
        except Exception as e:
            logging.warning("bad urlsafe value %s, %s" % (urlsafe, e))

        if blog and published_only and not blog.published:
            blog = None

        return blog

    @classmethod
    def create(cls, title, content, tags=None, **kws):
        """

        :rtype: ndb.Key
        :type title: str
        :type content: str
        :type tags: list
        """
        title = title.strip()
        tags = tags if tags else []
        key = cls.key_from_title(title)
        if not key.get():
            return cls(key=key,
                       title=title,
                       content=content,
                       tags=tags,
                       **kws).put()

    @classmethod
    def update(cls, urlsafe, **kw):
        try:
            blog = cls.get_by_urlsafe(urlsafe, False)
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

        except (ProtocolBufferDecodeError, TypeError) as e:
            logging.warning("bad urlsafe value: %s, %s" % (urlsafe, e))
            return None

    @classmethod
    def delete(cls, urlsafe):
        try:
            ndb.Key(urlsafe=urlsafe).delete()
        except TypeError as e:
            logging.warning("bad urlsafe value: %s, %s" % (urlsafe, e))

    @classmethod
    def all_titles(cls, published_only=True):
        if published_only:
            query = cls.query(cls.published == True)
        else:
            query = cls.query()

        return query.fetch(projection=[cls.title])

    @classmethod
    def get_blogs(cls, published_only=True):
        if published_only:
            query = cls.query(cls.published == True)
        else:
            query = cls.query()

        return query.order(- cls.last_modified).fetch()

    @classmethod
    def publish(cls, urlsafe, published):
        blog = cls.get_by_urlsafe(urlsafe, False)
        if blog:
            blog.published = published
            return blog.put()

    @classmethod
    def get_latest(cls):
        return cls.gql('where published=True order by last_modified desc').get()

    @classmethod
    def get_by_tags(cls, tags, published_only=True):
        """Return published blog by tags

        :param tags: comma separated list
        :param published_only: indicate querying published articles only
        :returns : a list of (title, key_urlsafe)"""

        if not type(tags) is list:
            tags = [tags]

        if published_only:
            query = Blog.query(Blog.published == True, Blog.tags.IN(tags)).order(-Blog.last_modified)
        else:
            query = Blog.query(Blog.tags.IN(tags)).order(-Blog.last_modified)

        return sorted(set([(b.title, b.key.urlsafe())
                           for b in query.fetch(projection=[Blog.title])]))

    @classmethod
    def get_archive_stats(cls, published_only=True):
        """Count the blog by date and put them in a Year-Month list.

        :param published_only:

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

        def func(data, metas):
            year, month, meta = metas
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

    @classmethod
    def get_tag_stats(cls, published_only=True):
        """Returns a dictionary with below data structure:

          :param published_only:
          :returns : tag: (year, month, title)
        """

        if published_only:
            q = Blog.query(Blog.published == True)
        else:
            q = Blog.query()

        blog_metas = [(b.tags, b.created.year, b.created.month, (b.title, b.key.urlsafe()))
                      for b in q.fetch(projection=[Blog.title, Blog.tags, Blog.created])]

        def func(data, metas):
            tags, year, month, title_urlsafe = metas
            for tag in tags:
                meta = (year, month, title_urlsafe)
                if tag in data:
                    data[tag].append(meta)
                else:
                    data[tag] = [meta]

            return data

        return reduce(func, blog_metas, {})

    @classmethod
    def get_older(cls, urlsafe, published_only=True):
        """get one blog that is created before current one
        :param published_only:
        :param urlsafe: urlsafe for current blog
        """

        current = ndb.Key(urlsafe=urlsafe).get()
        query = cls.query(cls.last_modified < current.last_modified, cls.published == published_only)
        return query.order(- cls.last_modified).get()

    @classmethod
    def get_newer(cls, urlsafe, published_only=True):
        """get one blog that is created after current one
        :param published_only:
        :param urlsafe: urlsafe for current blog
        """

        current = ndb.Key(urlsafe=urlsafe).get()
        query = cls.query(cls.last_modified > current.last_modified, cls.published == published_only)

        return query.order(- cls.last_modified).get()

    @classmethod
    def get_recent(cls):
        """returns the latest 10 blogs"""

        return cls.query(cls.published == True).order(- cls.last_modified).fetch(10)

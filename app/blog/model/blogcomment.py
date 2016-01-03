# coding=utf-8

from google.appengine.ext import ndb


class BlogComment(ndb.Model):
    screenname = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    created = ndb.DateProperty(auto_now_add=True)
    comment = ndb.TextProperty(required=True)

    @staticmethod
    def create(blog_key, screenname, email, comment):
        comment = BlogComment(parent=blog_key, screenname=screenname, email=email, comment=comment)

        return comment.put()

    @staticmethod
    def get_comments(blog_key):
        comments = BlogComment.query(ancestor=blog_key)

        return comments

    @staticmethod
    def destroy(urlsafe):
        ndb.Key(urlsafe=urlsafe).delete()

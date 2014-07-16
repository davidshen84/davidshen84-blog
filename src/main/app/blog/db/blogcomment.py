# coding=utf-8

import logging

from blog import Blog
from google.appengine.ext import ndb
from datetime import date, datetime

class BlogComment(ndb.Model):
  screenname = ndb.StringProperty(required=True)
  email = ndb.StringProperty(required=True)
  created = ndb.DateProperty(auto_now_add=True)
  comment = ndb.TextProperty(required=True)

  @staticmethod
  def create(blogKey, screenname, email, comment):
    comment = BlogComment(parent=blogKey, screenname=screenname, email=email, comment=comment)

    return comment.put()

  @staticmethod
  def getComments(blogkey):
    comments = BlogComment.query(ancestor=blogkey)

    return comments

  @staticmethod
  def destroy(urlsafe):
    ndb.Key(urlsafe=urlsafe).delete()

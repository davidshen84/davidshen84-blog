# coding=utf-8

import logging

from blog import Blog
from google.appengine.ext import db
from datetime import date, datetime

class BlogComment(db.Model):
  refblog = db.ReferenceProperty(reference_class=Blog, collection_name='comments', required=True)
  screenname = db.StringProperty(required=True)
  email = db.EmailProperty(required=True)
  created = db.DateProperty(auto_now_add=True)
  comment = db.TextProperty(required=True)

  @staticmethod
  def create(blogkey, screenname, email, comment):
    #blogkey = db.Key.from_path(BlogComment, '__key__')
    comment = BlogComment(refblog=blogkey, screenname=screenname, email=email, comment=comment)

    return comment.put()

  @staticmethod
  def getComments(blogkey):
    blog = Blog.get(blogkey)

    return blog.comments

  @staticmethod
  def destroy(commentid):
    comment = BlogComment.get_by_id(commentid)
    if comment:
      comment.delete()

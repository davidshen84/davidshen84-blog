# coding=utf-8

import logging

from flask import request, jsonify

from ..bloglib.blog import Blog
from ..bloglib.blogcomment import BlogComment

from apidecorator import login_admin

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save comment'

def query(urlsafe):
  blog = Blog.getByUrlsafe(urlsafe)

  if blog:
    comments = [ {'urlsafe': c.key.urlsafe(), 'screenname': c.screenname, 'email': c.email, 'comment': c.comment, 'created': str(c.created)}
                for c in BlogComment.getComments(blog.key) ]
  else:
    comments = []

  return jsonify(comments=comments)

def create(urlsafe):
  comment = request.json
  blog = Blog.getByUrlsafe(urlsafe)

  if blog:
    commentKey = BlogComment.create(blog.key, comment['screenname'], comment['email'], comment['comment'])
    return ''
  else:
    return MSG_SAVE_ERROR, 500

@login_admin
def destroy(urlsafe):
  BlogComment.destroy(urlsafe)
  return MSG_OK, 200

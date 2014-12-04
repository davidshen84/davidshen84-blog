# -*- coding: utf-8-unix -*-

import logging

from flask import Blueprint, request, jsonify

from blog.module.model.blog import Blog
from blog.module.model.blogcomment import BlogComment
from blog.module import login_admin


MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save comment'

mycommentapi = Blueprint('mycommentapi', __name__,
                         url_prefix='/blog/comment/api')
route = mycommentapi.route

@route('/sync/<urlsafe>')
def query(urlsafe):
  blog = Blog.getByUrlsafe(urlsafe)

  if blog:
    comments = [
      { 'urlsafe': c.key.urlsafe(),
        'screenname': c.screenname,
        'email': c.email,
        'comment': c.comment,
        'created': str(c.created)
      }
      for c in BlogComment.getComments(blog.key)
    ]
  else:
    comments = []

  return jsonify(comments=comments)

@route('/sync/<urlsafe>', methods=['POST'])
def create(urlsafe):
  comment = request.json
  blog = Blog.getByUrlsafe(urlsafe)

  if blog:
    commentKey = BlogComment\
      .create(blog.key,
              comment['screenname'],
              comment['email'],
              comment['comment'])
    return ''
  else:
    return MSG_SAVE_ERROR, 500

@route('/sync/<urlsafe>', methods=['DELETE'])
@login_admin
def destroy(urlsafe):
  BlogComment.destroy(urlsafe)
  return MSG_OK, 200

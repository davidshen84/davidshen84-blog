# coding=utf-8

import logging

from flask import request, jsonify
from app import app
from ..bloglib.blog import Blog
from ..bloglib.blogcomment import BlogComment

from apidecorator import login_admin

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save comment'

commentapi_route_base = '/blog/comment/api/'

@app.route(commentapi_route_base + 'sync/<title>')
def query_comment(title):
  blog = Blog.getByTitle(title)
  
  if blog:
    comments = [ {'id': c.key().id(), 'screenname': c.screenname, 'email': c.email, 'comment': c.comment, 'created': str(c.created)}
                for c in blog.comments ]
  else:
    comments = []

  return jsonify(comments=comments)

@app.route(commentapi_route_base + 'sync/<title>', methods=['POST'])
def create(title):
  comment = request.json
  blog = Blog.getByTitle(title)

  if blog:
    commentKey = BlogComment.create(blog.key(), comment['screenname'], comment['email'], comment['comment'])
    return ''
  else:
    return MSG_SAVE_ERROR, 500

@app.route(commentapi_route_base + 'sync/<int:id>', methods=['DELETE'])
@login_admin
def destroy(id):
  BlogComment.destroy(id)

  return MSG_OK

# coding=utf-8

import logging

from flask import Flask, request, jsonify
from blog import Blog
from blogcomment import BlogComment
from apidecorator import login_admin

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save comment'

app = Flask(__name__)
route_base = '/blog/comment/api/'

@app.route(route_base + 'sync')
def query():
  title = request.values['title']
  blog = Blog.getByTitle(title)
  
  if blog:
    comments = [ {'id': c.key().id(), 'screenname': c.screenname, 'email': c.email, 'comment': c.comment, 'created': str(c.created)}
                for c in blog.comments ]
  else:
    comments = []

  return jsonify(comments=comments)

@app.route(route_base + 'sync', methods=['POST'])
def create():
  comment = request.json
  blog = Blog.getByTitle(comment['blogtitle'])

  if blog:
    commentKey = BlogComment.create(blog.key(), comment['screenname'], comment['email'], comment['comment'])
    return ''
  else:
    return MSG_SAVE_ERROR, 500

@app.route(route_base + 'sync/<int:id>', methods=['DELETE'])
@login_admin
def destroy(id):
  BlogComment.destroy(id)

  return MSG_OK

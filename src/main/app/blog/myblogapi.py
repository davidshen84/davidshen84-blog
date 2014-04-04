# coding=utf-8

import logging
import re

from apidecorator import login_admin, simpleauth, auto_unquote
from google.appengine.api import users
from flask import render_template, request, make_response, jsonify, abort, redirect, json
from urllib import unquote

from ..bloglib.blog import Blog
from ..bloglib.blogcomment import BlogComment
from datetime import datetime

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save blog'
MSG_NOT_EXIST = 'blog does not exist'
MSG_DELETE_FAIL = 'delete blog failed'
MSG_UPDATE_FAIL = 'update blog failed'
MSG_NO_CONTENT = 'content is required'
MSG_SAVE_DUP = 'duplicate title'

@login_admin
def index():
  return jsonify(msg=users.get_current_user().nickname(), logout=users.create_logout_url('/blog/api/'))

@simpleauth
def query(publishedOnly):
  blogs = Blog.getBlogStatus(publishedOnly)
  # apply filters if provided
  f = request.values.get('f')
  if f:
    # filter the titles by each char
    blogs = map(lambda c: filter(lambda b: b.title.find(c) > -1, blogs), f)
    # reduce multiple lists into one, and get unique
    titles={}
    blogs = filter(lambda b: not titles.has_key(b.title) and not titles.update({b.title: 1}), reduce(lambda x, y: x + y, blogs))

  return jsonify(blogs=[ {'title': b.title, 'urlsafe': b.key.urlsafe(), 'published': b.published, 'lastmodified': b.lastmodified} for b in blogs ])

@simpleauth  
def fetch(urlsafe, publishedOnly):
  blog = Blog.getByUrlsafe(urlsafe, publishedOnly)

  if blog:
    comments = [ {'screenname': c.screenname, 'email': c.email, 'comment': c.comment}
                 for c in BlogComment.query(ancestor=blog.key) ]
    return jsonify(
      title=blog.title,
      content=blog.content,
      tags=blog.tags,
      published=blog.published,
      comments=comments)
  else:
    return MSG_NOT_EXIST, 404

@login_admin
def create():
  blog = request.json
  tags = blog['tags']
  # clean tags
  tags = [ t.strip() for t in tags ]
  tags = filter(lambda t: len(t) > 0, tags)
  blogkey = Blog.create(blog['title'], blog['content'], tags)

  if blogkey:
    return jsonify(msg=MSG_OK)
  else:
    return MSG_SAVE_ERROR, 500

@login_admin
def update(urlsafe):
  updateData = {}
  blog = request.json

  # update tags
  if blog.has_key('tags'):
    tags = blog['tags']
    # clean tags
    tags = [ t.strip() for t in tags ]
    tags = filter(lambda t: len(t) > 0, tags)
    updateData['tags'] = tags

  # update content
  if blog.has_key('content'):
    updateData['content'] = blog['content']

  # update publish status
  if blog.has_key('published'):
    updateData['published'] = blog['published']

  if Blog.update(urlsafe, **updateData):
    return jsonify(msg=MSG_OK)
  else:
    return MSG_UPDATE_FAIL, 404

@login_admin
def destroy(urlsafe):
  Blog.destroy(urlsafe)

  return MSG_OK

@login_admin
def publish(urlsafe):
  published = request.values['published'].lower() == 'true'
  blogkey = Blog.publish(urlsafe, published)

  if blogkey:
    return jsonify(msg=MSG_OK)
  else:
    return MSG_UPDATE_FAIL, 404

@simpleauth
def archives(publishedOnly):
  return jsonify(archives=Blog.getArchiveStats(publishedOnly))


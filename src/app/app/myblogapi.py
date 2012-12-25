# coding=utf-8

import logging
import re

from apidecorator import login_admin, simpleauth
from google.appengine.api import users
from flask import Flask, render_template, request, make_response, jsonify, abort, redirect, json
from bloglib import Blog, BlogComment
from datetime import datetime

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save blog'
MSG_NOT_EXIST = 'blog does not exist'
MSG_DELETE_FAIL = 'delete blog failed'
MSG_UPDATE_FAIL = 'update blog failed'
MSG_NO_CONTENT = 'content is required'
MSG_SAVE_DUP = 'duplicate title'

app = Flask(__name__)
route_base = '/blog/api/'

@app.route(route_base)
@login_admin
def index():
  return jsonify(msg=users.get_current_user().nickname(), logout=users.create_logout_url('/blog/api/'))

@app.route(route_base + 'sync')
def query():
  blogs = Blog.getBlogStatus(False)
  # apply filters if provided
  f = request.values.get('f')
  if f:
    # filter the titles by each char
    blogs = map(lambda c: filter(lambda b: b['title'].find(c) > -1, blogs), f)
    # reduce multiple lists into one, and get unique
    titles={}
    blogs = filter(lambda b: not titles.has_key(b['title']) and not titles.update({b['title']: 1}), reduce(lambda x, y: x + y, blogs))

  return jsonify(blogs=blogs)

@app.route(route_base + 'sync/<title>')
def fetch(title):
  blog = Blog.getByTitle(title, False)

  if blog:
    return jsonify(
      title=blog.title,
      content=blog.content,
      tags=blog.tags,
      published=blog.published,
      comments=[ {'screenname': c.screenname, 'email': c.email, 'comment': c.comment} for c in blog.comments ])
  else:
    return MSG_NOT_EXIST, 404

@app.route(route_base + 'sync', methods=['POST'])
def create():
  blog = request.json

  tags = blog['tags']
  # clean tags
  tags = [ t.strip() for t in tags ]
  tags = filter(lambda t: len(t) > 0, tags)
  blogcontent = blog['content']
  blogkey = Blog.create(blog['title'], blogcontent, tags)

  if blogkey:
    return jsonify(msg=MSG_OK)
  else:
    return MSG_SAVE_ERROR, 500

@app.route(route_base + 'sync/<title>', methods=['PUT'])
def update(title):
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

  blogkey = Blog.update(title, **updateData)

  if blogkey:
    return jsonify(msg=MSG_OK)
  else:
    return MSG_UPDATE_FAIL, 404

@app.route(route_base + 'sync/<title>', methods=['DELETE'])
def destroy(title):
  Blog.destroy(title)

  return ''

@app.route(route_base + 'syncpub/<title>', methods=['PUT'])
def publish(title):
  published = request.values['published'].lower() == 'true'
  blogkey = Blog.publish(title, published=published)

  if blogkey:
    return jsonify(msg=MSG_OK)
  else:
    return MSG_UPDATE_FAIL, 404

@app.route(route_base + 'archives')
@simpleauth
def archives(publishedOnly):
  return jsonify(archives=Blog.getArchiveStats(publishedOnly))


# coding=utf-8

import logging
import re

from apidecorator import login_admin, simpleauth
from google.appengine.api import users
from flask import Flask, render_template, request, jsonify, abort, redirect
from blog import Blog
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
  blog = request.json

  tags = blog['tags']
  # clean tags
  tags = [ t.strip() for t in tags ]
  tags = filter(lambda t: len(t) > 0, tags)
  blogcontent = blog['content']
  blogkey = Blog.update(title, blogcontent, tags)

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

@app.route(route_base + 'titles')
def titles():
  titles = Blog.allTitles(False)
  # apply filters if provided
  f = request.values.get('f')
  if f:
    # filter the titles by each char
    titles = map(lambda c: filter(lambda t: t.find(c) > -1, titles), f)
    # reduce multiple lists into one, and get unique
    titles = list(set(reduce(lambda x, y: x + y, titles)))

  return jsonify(titles=titles)

@app.route(route_base + 'archives')
@simpleauth
def archives(publishedOnly):
  return jsonify(archives=Blog.getArchiveStats(publishedOnly))


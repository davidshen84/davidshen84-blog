# coding=utf-8

import logging
import re
import json

from flask import Flask, render_template, request, jsonify, abort, redirect, url_for
from markdown2 import markdown
from bloglib import Blog, BlogComment

BAD_SP = unichr(0xa0)
app = Flask(__name__)
route_base = '/blog/'

monthFullName = ['January', 'February', 'March', 'April',
                  'May', 'June', 'July', 'August',
                  'September', 'October', 'November', 'December']

@app.route(route_base)
def default():
  myblog = Blog.getLatest()
  if myblog:
    created = myblog.created
    return redirect(url_for('blog', year=created.year, month=created.month, title=myblog.title))
  else:
    return abort(404)

@app.route(route_base + '<int:year>/<int:month>/<title>')
def blog(year, month, title):
  myblog = Blog.getByTitle(title)

  if myblog:
    created = myblog.created
    articlePath = '%s%d/%d/%s' % (route_base, created.year, created.month, myblog.title)
    comments = myblog.comments

    year = created.year
    month = created.month
    blogtitle = myblog.title
    blogcontent = re.sub(r'^#.*$', '', myblog.content, 1, re.M | re.U).replace(BAD_SP, ' ')
    breadcrumbs = [ {'href': route_base, 'text': 'blog'},
                    {'href': route_base + '%d/' % (year), 'text': year},
                    {'href': route_base + '%d/%d/' % (year, month), 'text': month},
                    {'href': '#', 'text': myblog.title} ]
  else:
    return abort(404)

  return render_template('blog.html',
                         title=blogtitle,
                         tags=','.join(myblog.tags),
                         article=markdown(blogcontent),
                         breadcrumbs=breadcrumbs,
                         comments=comments,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=articlePath,
                         isXhr=request.is_xhr)

@app.route(route_base + '<int:year>/')
@app.route(route_base + '<int:year>/<int:month>/')
def archivesByDate(year, month=None):
  breadcrumbs = []
  myblogs = Blog.getArchiveStats(True)

  if myblogs:
    breadcrumbs = [ {'href': route_base, 'text': 'blog'},
                    {'href': route_base + '%d/' % (year), 'text': year} ]
    if month:
      breadcrumbs.append({'href': route_base + '%d/%d/' % (year, month), 'text': month})

  return render_template('bloglist.html',
                         title='blog list',
                         year=year, month=month,
                         breadcrumbs=breadcrumbs,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr)

@app.route(route_base + 'tag/', defaults={'tag': None})
@app.route(route_base + 'tag/<tag>/')
def archivesByTags(tag):
  breadcrumbs = []
  myblogs = Blog.getArchiveStats(True)

  if myblogs:
    breadcrumbs = [ {'href': route_base, 'text': 'blog'},
                    {'href': route_base + 'tag/', 'text': 'tag'} ]

  if tag:
    breadcrumbs.append({'href': route_base + 'tag/%s/' % (tag), 'text': tag})

  return render_template('bloglist.html',
                         title='blog list',
                         tag=tag,
                         breadcrumbs=breadcrumbs,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr)

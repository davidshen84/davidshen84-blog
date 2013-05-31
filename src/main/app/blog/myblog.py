# coding=utf-8

import logging
import re
import json

from flask import render_template, request, jsonify, abort, redirect, url_for
from markdown2 import markdown

from app import app
from ..bloglib.blog import Blog
from ..bloglib.blogcomment import BlogComment

BAD_SP = unichr(0xa0)
blog_route_base = '/blog/'

monthFullName = ['January', 'February', 'March', 'April',
                  'May', 'June', 'July', 'August',
                  'September', 'October', 'November', 'December']

@app.route(blog_route_base)
def default():
  myblog = Blog.getLatest()
  if myblog:
    created = myblog.created
    return redirect(url_for('blog', year=created.year, month=created.month, title=myblog.title))
  else:
    return abort(404)

@app.route(blog_route_base + '<int:year>/<int:month>/<title>')
def blog(year, month, title):
  myblog = Blog.getByTitle(title)

  if myblog:
    created = myblog.created
    articlePath = '%s%d/%d/%s' % (blog_route_base, created.year, created.month, myblog.title)
    comments = myblog.comments

    year = created.year
    month = created.month
    blogtitle = myblog.title
    blogcontent = re.sub(r'^#.*$', '', myblog.content, 1, re.M | re.U).replace(BAD_SP, ' ')
    breadcrumbs = [ {'href': blog_route_base, 'text': 'blog'},
                    {'href': blog_route_base + '%d/' % (year), 'text': year},
                    {'href': blog_route_base + '%d/%d/' % (year, month), 'text': month},
                    {'href': '#', 'text': myblog.title} ]
  else:
    return abort(404)

  return render_template('blog/blog.html',
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

@app.route(blog_route_base + '<int:year>/')
@app.route(blog_route_base + '<int:year>/<int:month>/')
def archivesByDate(year, month=None):
  breadcrumbs = []
  myblogs = Blog.getArchiveStats(True)

  if myblogs:
    breadcrumbs = [ {'href': blog_route_base, 'text': 'blog'},
                    {'href': blog_route_base + '%d/' % (year), 'text': year} ]
    if month:
      breadcrumbs.append({'href': blog_route_base + '%d/%d/' % (year, month), 'text': month})

  return render_template('blog/bloglist.html',
                         title='blog list',
                         year=year, month=month,
                         breadcrumbs=breadcrumbs,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr)

@app.route(blog_route_base + 'tag/', defaults={'tag': None})
@app.route(blog_route_base + 'tag/<tag>/')
def archivesByTags(tag):
  breadcrumbs = []
  myblogs = Blog.getArchiveStats(True)

  if myblogs:
    breadcrumbs = [ {'href': blog_route_base, 'text': 'blog'},
                    {'href': blog_route_base + 'tag/', 'text': 'tag'} ]

  if tag:
    breadcrumbs.append({'href': blog_route_base + 'tag/%s/' % (tag), 'text': tag})

  return render_template('blog/bloglist.html',
                         title='blog list',
                         tag=tag,
                         breadcrumbs=breadcrumbs,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr)

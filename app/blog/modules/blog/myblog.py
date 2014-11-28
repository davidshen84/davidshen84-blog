# coding=utf-8

import logging
import re
import json

from flask import render_template, request, jsonify, abort, redirect, url_for
from markdown2 import markdown
from . import is_admin
from apidecorator import auto_unquote
from urllib import quote

from db.blog import Blog
from db.blogcomment import BlogComment


BAD_SP = unichr(0xa0)
blog_route_base = '/blog/'

monthFullName = ['January', 'February', 'March', 'April',
                  'May', 'June', 'July', 'August',
                  'September', 'October', 'November', 'December']

def default():
  myblog = Blog.getLatest()
  if myblog:
    created = myblog.created
    return redirect(url_for('blog', year=created.year, month=created.month, urlsafe=myblog.key.urlsafe()))
  else:
    return abort(404)

def blog(year, month, urlsafe):
  myblog = Blog.getByUrlsafe(urlsafe)

  if myblog:
    created = myblog.created
    articlePath = '%s%d/%d/%s' % (blog_route_base, created.year, created.month, myblog.title)
    comments = BlogComment.query(ancestor=myblog.key)

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
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         isAdmin=is_admin(),
                         activePill="blog")

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
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         isAdmin=is_admin())

def archivesByTags(tag):

  if not tag:
    return abort(403)

  breadcrumbs = []
  myblogs = Blog.getArchiveStats(True)

  if myblogs:
    breadcrumbs = [ {'href': blog_route_base, 'text': 'blog'},
                    {'href': blog_route_base + 'tag/', 'text': 'tag'} ]

  if tag:
    breadcrumbs.append({'href': blog_route_base + 'tag/%s/' % (tag), 'text': tag})

  return render_template('blog/bloglist.html',
                         title='blog list',
                         tag=tag or '',
                         breadcrumbs=breadcrumbs,
                         archives=Blog.getArchiveStats(),
                         tagstats=Blog.getTagStats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         isAdmin=is_admin())


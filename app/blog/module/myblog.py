# -*- coding: utf-8-unix -*-

import json
import logging
import re

from flask import Blueprint, render_template, request, \
  jsonify, abort, redirect, url_for
from urllib import quote

from blog.module import is_admin, auto_unquote
from blog.module.model.blog import Blog
from blog.module.model.blogcomment import BlogComment
from lib.markdown2 import markdown

BAD_SP = unichr(0xa0)

myblog = Blueprint('myblog', __name__,
                   url_prefix='/blog')
route = myblog.route
monthFullName = ['January', 'February', 'March', 'April',
                 'May', 'June', 'July', 'August',
                 'September', 'October', 'November', 'December']


@route('/')
def default():
  myblog = Blog.get_latest()
  if myblog:
    created = myblog.created
    return redirect(url_for('myblog.blog',
                            year=created.year,
                            month=created.month,
                            urlsafe=myblog.key.urlsafe()))
  else:
    return abort(404)


@route('/<int:year>/<int:month>/<urlsafe>')
def blog(year, month, urlsafe):
  myblog = Blog.get_by_urlsafe(urlsafe)

  if myblog:
    created = myblog.created
    articlePath = url_for('myblog.blog', year=created.year,
                          month=created.month, urlsafe=myblog.key.urlsafe())
    comments = BlogComment.query(ancestor=myblog.key)

    year = created.year
    month = created.month
    blogtitle = myblog.title
    blogcontent = re.sub(r'^#.*$', '', myblog.content, 1, re.M | re.U) \
      .replace(BAD_SP, ' ')
    breadcrumbs = [
      {'href': url_for('myblog.default'), 'text': 'blog'},
      {'href': url_for('myblog.archivesByDate', year=year), 'text': year},
      {'href': url_for('myblog.archivesByDate', year=year, month=month), 'text': month},
      {'href': '#', 'text': myblog.title}
    ]

    # get older and newer
    older = Blog.get_older(urlsafe)
    if older is None:
      older_url = '#'
    else:
      older_url = url_for('myblog.blog', year=older.created.year, month=older.created.year, urlsafe=older.key.urlsafe())

    newer = Blog.get_newer(urlsafe)
    if newer is None:
      newer_url = '#'
    else:
      newer_url = url_for('myblog.blog', year=newer.created.year, month=newer.created.year, urlsafe=newer.key.urlsafe())
  else:
    return abort(404)

  return render_template('blog/blog.html',
                         title=blogtitle,
                         tags=','.join(myblog.tags),
                         article=markdown(blogcontent),
                         # breadcrumbs=breadcrumbs,
                         comments=comments,
                         # archives=Blog.get_archive_stats(),
                         # tagstats=Blog.get_tag_stats(),
                         monthFullName=monthFullName,
                         articlePath=articlePath,
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         is_admin=is_admin(),
                         # activePill="blog",
                         older_url=older_url,
                         newer_url=newer_url)


@route('/<int:year>/')
@route('/<int:year>/<int:month>/')
def archivesByDate(year, month=None):
  breadcrumbs = []
  myblogs = Blog.get_archive_stats(True)

  if myblogs:
    breadcrumbs = [
      {'href': url_for('myblog.default'), 'text': 'blog'},
      {'href': url_for('myblog.archivesByDate', year=year), 'text': year}
    ]

    if month:
      breadcrumbs.append({
        'href': url_for('myblog.archivesByDate', year=year, month=month),
        'text': month
      })

  return render_template('blog/bloglist.html',
                         title='blog list',
                         year=year, month=month,
                         breadcrumbs=breadcrumbs,
                         archives=Blog.get_archive_stats(),
                         tagstats=Blog.get_tag_stats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         isAdmin=is_admin())


@route('/tag/')
def notag():
  return abort(403)


@route('/tag/<tag>/')
def archivesByTags(tag):
  breadcrumbs = []
  myblogs = Blog.get_archive_stats(True)

  if myblogs:
    breadcrumbs = [
      {'href': url_for('myblog.default'), 'text': 'blog'},
      {'href': url_for('myblog.archivesByTags', tag=tag), 'text': tag}
    ]

  return render_template('blog/bloglist.html',
                         title='blog list',
                         tag=tag or '',
                         breadcrumbs=breadcrumbs,
                         archives=Blog.get_archive_stats(),
                         tagstats=Blog.get_tag_stats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr or request.args.has_key('xhr'),
                         isAdmin=is_admin())

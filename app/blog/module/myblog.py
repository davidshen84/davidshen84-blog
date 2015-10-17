# -*- coding: utf-8-unix -*-

import re

from flask import Blueprint, render_template, request, abort, redirect, url_for

from blog.module import is_admin
from blog.module.model.blog import Blog
from blog.module.model.blogcomment import BlogComment
from lib.markdown2 import markdown

BAD_SP = unichr(0xa0)

blueprint = Blueprint('myblog', __name__, url_prefix='/blog')
route = blueprint.route

monthFullName = ['January', 'February', 'March', 'April',
                 'May', 'June', 'July', 'August',
                 'September', 'October', 'November', 'December']


def strip_title(content):
  return re.sub(r'^#.*$', '', content, 1, re.M | re.U).replace(BAD_SP, ' ')


def url_for_blog(b):
  created = b.created

  return url_for('.blog', year=created.year, month=created.month, urlsafe=b.key.urlsafe())


@route('/')
def index():
  recent_blogs = [{'created': b.created, 'title': b.title, 'url': url_for_blog(b),
                   'content': markdown(''.join(strip_title(b.content).splitlines(True)[:10]))}
                  for b in Blog.get_recent()]
  latest_blog = Blog.query().order(- Blog.created).get()

  latest_blog_url = '#'
  if latest_blog is not None:
    latest_blog_url = url_for('.blog', year=latest_blog.created.year,
                              month=latest_blog.created.month, urlsafe=latest_blog.key.urlsafe())

  return render_template('blog/index.html',
                         recent_blogs=recent_blogs,
                         latest_blog=latest_blog_url)


@route('/<int:year>/<int:month>/<urlsafe>')
def blog(year, month, urlsafe):
  myblog = Blog.get_by_urlsafe(urlsafe)

  if not myblog:
    return abort(404)

  created = myblog.created
  article_path = url_for('.blog', year=created.year,
                         month=created.month, urlsafe=myblog.key.urlsafe())
  comments = BlogComment.query(ancestor=myblog.key)

  # year = created.year
  # month = created.month
  blog_title = myblog.title
  blog_content = strip_title(myblog.content)
  # breadcrumbs = [
  #   {'href': url_for('myblog.default'), 'text': 'blog'},
  #   {'href': url_for('myblog.archivesByDate', year=year), 'text': year},
  #   {'href': url_for('myblog.archivesByDate', year=year, month=month), 'text': month},
  #   {'href': '#', 'text': myblog.title}
  # ]

  # get older and newer
  older = Blog.get_older(urlsafe)
  older_url = '#'
  if older is not None:
    older_url = url_for('.blog', year=older.created.year, month=older.created.year, urlsafe=older.key.urlsafe())

  newer = Blog.get_newer(urlsafe)
  newer_url = '#'
  if newer is not None:
    newer_url = url_for('.blog', year=newer.created.year, month=newer.created.year, urlsafe=newer.key.urlsafe())

  return render_template('blog/blog.html',
                         title=blog_title,
                         tags=','.join(myblog.tags),
                         article=markdown(blog_content),
                         # breadcrumbs=breadcrumbs,
                         comments=comments,
                         # archives=Blog.get_archive_stats(),
                         # tagstats=Blog.get_tag_stats(),
                         monthFullName=monthFullName,
                         articlePath=article_path,
                         isXhr=request.is_xhr or ('xhr' in request.args),
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
      {'href': url_for('.default'), 'text': 'blog'},
      {'href': url_for('.archivesByDate', year=year), 'text': year}
    ]

    if month:
      breadcrumbs.append({
        'href': url_for('.archivesByDate', year=year, month=month),
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
                         isXhr=request.is_xhr or ('xhr' in request.args),
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
      {'href': url_for('.default'), 'text': 'blog'},
      {'href': url_for('.archivesByTags', tag=tag), 'text': tag}
    ]

  return render_template('blog/bloglist.html',
                         title='blog list',
                         tag=tag or '',
                         breadcrumbs=breadcrumbs,
                         archives=Blog.get_archive_stats(),
                         tagstats=Blog.get_tag_stats(),
                         monthFullName=monthFullName,
                         articlePath=request.path,
                         isXhr=request.is_xhr or ('xhr' in request.args),
                         isAdmin=is_admin())

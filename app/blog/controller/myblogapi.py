# -*- coding: utf-8-unix -*-

import json

from flask import Blueprint, request, jsonify
from google.appengine.api import users

from blog.controller import login_admin, simple_auth
from blog.model.blog import Blog
from blog.model.blogcomment import BlogComment

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save blog'
MSG_NOT_EXIST = 'blog does not exist'
MSG_DELETE_FAIL = 'delete blog failed'
MSG_UPDATE_FAIL = 'update blog failed'
MSG_NO_CONTENT = 'content is required'
MSG_SAVE_DUP = 'duplicate title'

blueprint = Blueprint('mybloapi', __name__, url_prefix='/blog/api')
route = blueprint.route


@route('/')
@login_admin
def index():
    return jsonify(msg=users.get_current_user().nickname(), logout=users.create_logout_url('/blog/api/'))


@route('/sync')
@simple_auth
def query(published_only):
    blogs = Blog.get_blog_status(published_only)
    # apply filters if provided
    f = request.values.get('f')
    if f:
        # filter the titles by each char
        blogs = map(lambda c: filter(lambda b: b.title.find(c) > -1, blogs), f)
        # reduce multiple lists into one, and get unique
        titles = {}
        blogs = filter(lambda b: not titles.has_key(b.title) and not titles.update({b.title: 1}),
                       reduce(lambda x, y: x + y, blogs))

    return json.dumps(
        [{'title': b.title, 'urlsafe': b.key.urlsafe(),
          'published': b.published, 'last_modified': b.last_modified.strftime('%Y/%m/%d')}
         for b in blogs])


@route('/sync/<urlsafe>')
@simple_auth
def fetch(urlsafe, published_only):
    blog = Blog.get_by_urlsafe(urlsafe, published_only)

    if blog:
        comments = [{'screen_name': c.screen_name, 'email': c.email, 'comment': c.comment}
                    for c in BlogComment.query(ancestor=blog.key)]
        return jsonify(
            title=blog.title,
            content=blog.content,
            tags=blog.tags,
            published=blog.published,
            comments=comments)
    else:
        return MSG_NOT_EXIST, 404


@route('/sync', methods=['POST'])
@login_admin
def create():
    blog = request.json
    if blog is None:
        return MSG_SAVE_ERROR, 500

    tags = blog['tags'] if 'tags' in blog else []
    # clean tags
    tags = [t.strip() for t in tags]
    tags = filter(lambda t: len(t) > 0, tags)
    blog_key = Blog.create(blog['title'], blog['content'], tags)

    if blog_key:
        return jsonify(msg=MSG_OK)
    else:
        return MSG_SAVE_ERROR, 500


@route('/sync/<urlsafe>', methods=['PUT'])
@login_admin
def update(urlsafe):
    update_data = {}
    blog = request.json

    if not blog:
        return MSG_NO_CONTENT, 500

    # update tags
    if 'tags' in blog:
        tags = blog['tags']
        # clean tags
        tags = [t.strip() for t in tags]
        tags = filter(lambda t: len(t) > 0, tags)
        update_data['tags'] = tags

    # update content
    if 'content' in blog:
        update_data['content'] = blog['content']

    # update publish status
    if 'published' in blog:
        update_data['published'] = blog['published']

    if Blog.update(urlsafe, **update_data):
        return jsonify(msg=MSG_OK)
    else:
        return MSG_UPDATE_FAIL, 404


@route('/sync/<urlsafe>', methods=['DELETE'])
@login_admin
def destroy(urlsafe):
    Blog.destroy(urlsafe)

    return MSG_OK


@route('/syncpub/<urlsafe>', methods=['PUT'])
@login_admin
def publish(urlsafe):
    published = request.values['published'].lower() == 'true'
    blog_key = Blog.publish(urlsafe, published)

    if blog_key:
        return jsonify(msg=MSG_OK)
    else:
        return MSG_UPDATE_FAIL, 404


@route('/archives')
@simple_auth
def archives(published_only):
    return jsonify(archives=Blog.get_archive_stats(published_only))

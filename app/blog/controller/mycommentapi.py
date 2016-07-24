import json

from flask import Blueprint, request, jsonify

from blog.controller import require_admin, format_date
from blog.model import Blog
from blog.model import Comment

MSG_OK = 'ok'
MSG_SAVE_ERROR = 'failed to save comment'

blueprint = Blueprint('mycommentapi', __name__, url_prefix='/blog/comment/api')
route = blueprint.route


@route('/sync/<urlsafe>')
def query(urlsafe):
    blog = Blog.get_by_urlsafe(urlsafe)

    if blog:
        comments = [{'urlsafe': c.key.urlsafe(),
                     'screen_name': c.screen_name,
                     'email': c.email,
                     'comment': c.comment,
                     'created': format_date(c.created)}
                    for c in Comment.get_comments(blog.key)]
    else:
        comments = []

    return json.dumps(comments)


@route('/sync/<urlsafe>', methods=['POST'])
def create(urlsafe):
    comment = request.json
    blog = Blog.get_by_urlsafe(urlsafe)

    if blog:
        comment_key = Comment.create(blog.key, comment['screen_name'],
                                     comment['email'], comment['comment'])
        comment = comment_key.get()

        return jsonify({'screen_name': comment.screen_name,
                        'comment': comment.comment,
                        'created': format_date(comment.created)})
    else:
        return MSG_SAVE_ERROR, 500


@route('/sync/<urlsafe>', methods=['DELETE'])
@require_admin
def destroy(urlsafe):
    Comment.delete(urlsafe)
    return MSG_OK, 200

from __future__ import absolute_import, print_function

from blog.model import Blog, Comment
from flask import Blueprint
from flask import request
from flask.ext.restful import Resource, Api, marshal_with, fields, abort
from marshmallow import Schema
from marshmallow import post_load
from blog.resources import UrlSafe, FormattedDate, require_admin

blueprint = Blueprint('blog comments', __name__, url_prefix='/blog/resources')
api = Api(blueprint)

resource_fields = {
    'urlsafe': UrlSafe(attribute='key'),
    'screen_name': fields.String,
    'email': fields.String,
    'comment': fields.String,
    'created': FormattedDate(attribute='created')
}

resource_list = [
    fields.List(fields.Nested(resource_fields)),
]


class CommentSchema(Schema):
    from marshmallow import fields

    screen_name = fields.String(required=True)
    email = fields.Email(required=True)
    comment = fields.String(required=True)

    def __init__(self, blog_key):
        super(Schema, self).__init__()
        self.blog_key = blog_key

    @post_load
    def create_comment(self, data):
        return Comment(parent=self.blog_key, **data)


class CommentResource(Resource):
    @marshal_with(resource_fields)
    def get(self, urlsafe):
        blog = Blog.get_by_urlsafe(urlsafe)
        if blog:
            return Comment.get_comments(blog.key).fetch()
        else:
            return []

    def post(self, urlsafe):
        blog = Blog.get_by_urlsafe(urlsafe)
        if blog:
            comment_schema = CommentSchema(blog.key)
            comment, error = comment_schema.load(request.json)
            if not error:
                comment.put()
                return None, 201
            else:
                return error, 500
        else:
            abort(404)

    @require_admin
    def delete(self, urlsafe):
        Comment.delete(urlsafe)


api.add_resource(CommentResource, '/comments/<string:urlsafe>')

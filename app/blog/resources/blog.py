from __future__ import absolute_import

from blog import model
from blog.controller import simple_auth, require_admin
from blog.resources import FormattedDate, UrlSafe
from flask import Blueprint, request
from flask.ext.restful import Resource, Api, fields, marshal_with, abort
from marshmallow import Schema, post_load

blueprint = Blueprint('blog resource', __name__, url_prefix='/blog/resources')
api = Api(blueprint)

MESSAGE_OK = 'OK~'

resource_fields = {
    'title': fields.String,
    'last_modified': FormattedDate(attribute='last_modified'),
    'content': fields.String,
    'tags': fields.List(fields.String())
}


class BlogSchema(Schema):
    from marshmallow import fields

    title = fields.String(required=True)
    content = fields.String(required=True)
    tags = fields.List(fields.String())

    @post_load
    def create_blog(self, data):
        return model.Blog(**data)


class BlogResource(Resource):
    @simple_auth
    @marshal_with(resource_fields)
    def get(self, urlsafe, published_only):
        blog = model.Blog.get_by_urlsafe(urlsafe, published_only)

        return blog if blog else abort(404)

    @require_admin
    @marshal_with({'urlsafe': UrlSafe(attribute='key')})
    def post(self):
        blog_schema = BlogSchema()
        data, error = blog_schema.load(request.json)
        return {'key': data.put()}, 201

    @require_admin
    def put(self, urlsafe):
        if not request.json:
            abort(500, message="No Content")

        # blog_update = json.loads(request.json)
        if model.Blog.update(urlsafe, **request.json):
            return {'message': MESSAGE_OK}
        else:
            return None, 404

    @require_admin
    def delete(self, urlsafe):
        model.Blog.delete(urlsafe)


api.add_resource(BlogResource, '/blogs/', '/blogs/<string:urlsafe>')

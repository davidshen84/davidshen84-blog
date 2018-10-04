from __future__ import absolute_import

from blog.controller import simple_auth
from blog.model import Blog
from blog.resources import FormattedDate, UrlSafe
from flask import Blueprint, request
from flask.ext.restful import Resource, Api, fields, marshal_with
from flask_cors import CORS

blueprint = Blueprint('blog list', __name__, url_prefix='/blog/resources')
CORS(blueprint, origins=['https://davidshen84.github.io/', 'http://localhost:4200'])
api = Api(blueprint)

resource_fields = {
    'title': fields.String,
    'published': fields.Boolean,
    'last_modified': FormattedDate(attribute='last_modified'),
    'urlsafe': UrlSafe(attribute='key')
}


class BlogListResource(Resource):
    @simple_auth
    @marshal_with(resource_fields)
    def get(self, published_only):
        query = request.args.get('query')
        collection = Blog.get_blogs(published_only)

        # a simple per character filter
        return collection if not query else dict(((blog.key.urlsafe(), blog) for blog in collection
                                                  for c in query.lower()
                                                  if blog.title.lower().find(c) > -1)).values()


api.add_resource(BlogListResource, '/blogs')

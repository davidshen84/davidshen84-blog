from __future__ import absolute_import

from flask import Blueprint, request

from blog.model import Blog
from blog.resources import FormattedDate, UrlSafe, authorize
from flask_cors import CORS
from flask_restful import Resource, Api, fields, marshal_with

blueprint = Blueprint('blog list', __name__, url_prefix='/blog/resources')
CORS(blueprint, origins=['https://davidshen84.github.io', 'http://localhost:4200'])
api = Api(blueprint)

resource_fields = {
    'title': fields.String,
    'published': fields.Boolean,
    'last_modified': FormattedDate(attribute='last_modified'),
    'urlsafe': UrlSafe(attribute='key')
}


class BlogListResource(Resource):
    @authorize(required=False, published_only=True)
    @marshal_with(resource_fields)
    def get(self, published_only=True):
        query = request.args.get('query')
        collection = Blog.get_blogs(published_only=published_only)

        # a simple per character filter
        return collection if not query else dict(((blog.key.urlsafe(), blog) for blog in collection
                                                  for c in query.lower()
                                                  if blog.title.lower().find(c) > -1)).values()


api.add_resource(BlogListResource, '/blogs')

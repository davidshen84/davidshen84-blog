from flask import Blueprint
from flask_cors import CORS
from flask_restful import Resource, Api, fields, marshal_with
from google.cloud.datastore import Client

from blog.resources import FormattedDate, authorize, IdOrName

blueprint = Blueprint('blog list', __name__, url_prefix='/blog/resources')
CORS(blueprint, origins=['https://davidshen84.github.io', 'http://localhost:4200'])
api = Api(blueprint)

resource_fields = {
    'title': fields.String,
    'published': fields.Boolean,
    'last_modified': FormattedDate(attribute='last_modified'),
    'id_or_name': IdOrName(attribute='key')
}


class BlogListResource(Resource):
    @authorize(required=False, published_only=True)
    @marshal_with(resource_fields)
    def get(self, published_only=True):
        client = Client()
        query = client.query(kind='Blog',
                             filters=(['published', '=', published_only],))
        collection = [b for b in query.fetch()]

        return collection


api.add_resource(BlogListResource, '/blogs')

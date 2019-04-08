from flask import Blueprint
from flask_restful import Resource, Api
from flask_restful.reqparse import RequestParser
from google.cloud.datastore import Client, Entity

bp = Blueprint('datastore api', __name__, url_prefix='/gcloud/datastore')
api = Api(bp)


class DatastoreResource(Resource):
    def __init__(self):
        super(DatastoreResource, self).__init__()

        self._client = Client()
        self._parser = RequestParser()
        self._parser.add_argument('value', type=str, required=False)

    def get(self):
        query = self._client.query(kind='Test')
        data = query.fetch(limit=10)

        return [d for d in data]

    def post(self):
        reqargs = self._parser.parse_args()
        key = self._client.key('Test')
        data = Entity(key=key)
        data['value'] = reqargs['value']
        self._client.put(data)

        return data


api.add_resource(DatastoreResource, '/')

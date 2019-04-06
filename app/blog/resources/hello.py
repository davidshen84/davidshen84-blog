import os

from flask import Blueprint
from flask_restful import Resource, Api
from google.cloud import datastore

bp = Blueprint('hello python37', __name__, url_prefix='/py37')
api = Api(bp)


class HelloResource(Resource):
    def get(self):
        return 'hello python 3.7'


class DSResource(Resource):
    def get(self):
        client = datastore.Client()
        # The kind for the new entity
        kind = 'Blog'
        # The name/ID for the new entity
        name = 'How to set IPython Notebook cell and editor indentation'
        # The Cloud Datastore key for the new entity
        query = client.query(kind='Blog')

        blogs_iter = query.fetch(limit=5)
        blogs = [(b['title'], repr(b.key)) for b in blogs_iter]
        print(blogs)

        return blogs


api.add_resource(HelloResource, '/')
api.add_resource(DSResource, '/ds')

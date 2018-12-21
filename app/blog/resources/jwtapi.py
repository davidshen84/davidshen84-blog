from __future__ import absolute_import, print_function

import os

from flask import Blueprint

import jwt
from flask_restful import Api, Resource
from jwt import InvalidTokenError
from jwt.contrib.algorithms.pycrypto import RSAAlgorithm

blueprint = Blueprint('jwt api', __name__, url_prefix='/blog/resources')
api = Api(blueprint)

jwt.register_algorithm('RS256', RSAAlgorithm(RSAAlgorithm.SHA256))
public_key = os.environ['public_key'].encode('ascii')


class ApiResource(Resource):

    def get(self, encoded):
        try:
            decoded = jwt.decode(encoded, public_key, algorithms='RS256', verify=True, issuer='urn:test')
        except InvalidTokenError as e:
            return 'error', 401
        return decoded, 200


api.add_resource(ApiResource, '/jwt/<string:encoded>')

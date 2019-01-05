from __future__ import absolute_import

import pytest
from mock import patch, MagicMock
from werkzeug.exceptions import Unauthorized

from blog.resources import authorize
from jwt import InvalidTokenError


class TestAuthorizeDecorator(object):
    def setup_method(self):
        self.parser = MagicMock()

    def teardown_method(self):
        assert self.parser.add_argument.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_valid_authorization_header(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'Bearer token'
        }

        @authorize(required=True)
        def target():
            return True

        assert target()
        decode_mock.assert_called_with('token', 'pk', algorithms='RS256',
                                       options={'require_nbf': True, 'require_exp': True})

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_authorization_not_required(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': None
        }

        @authorize(required=False)
        def target():
            return True

        assert target()
        assert not decode_mock.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_bad_authorization_header(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'bad'
        }

        @authorize(required=True)
        def target():
            return True

        with pytest.raises(Unauthorized):
            target()
        assert not decode_mock.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_bad_authorization_scheme(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'bad scheme'
        }

        @authorize(required=True)
        def target():
            return True

        with pytest.raises(Unauthorized):
            target()
        assert not decode_mock.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_invalid_token(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'Bearer bad_token'
        }
        decode_mock.side_effect = InvalidTokenError()

        @authorize(required=True)
        def target():
            return True

        with pytest.raises(Unauthorized):
            target()
        assert decode_mock.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_call_target_with_known_parameter(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'Bearer bad_token'
        }
        decode_mock.return_value = {
            'p': True
        }

        @authorize(required=True, p=True)
        def target(p):
            return p

        assert target()
        assert decode_mock.called

    @patch('blog.resources.jwt.decode')
    @patch('blog.resources.RequestParser')
    def test_wont_call_target_with_parameter(self, request_parser_mock, decode_mock):
        request_parser_mock.return_value = self.parser
        self.parser.parse_args.return_value = {
            'Authorization': 'Bearer bad_token'
        }
        decode_mock.return_value = {
            'p': True
        }

        @authorize(required=True, p=True)
        def target(q):
            return q

        with pytest.raises(TypeError):
            target()
        assert decode_mock.called

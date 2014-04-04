# coding=utf-8

from flask import abort
from functools import wraps
from google.appengine.api import users
from urllib import unquote

def login_admin(f):
  @wraps(f)
  def func(*args, **kwargs):
    if users.is_current_user_admin():
      return f(*args, **kwargs)
    else:
      abort(401)
  return func

def simpleauth(f):
  @wraps(f)
  def func(*args, **kwargs):
      kwargs["publishedOnly"] = not users.is_current_user_admin()
      return f(*args, **kwargs)
  return func

def auto_unquote(unquotee):
  def decorated(f):
    @wraps(f)
    def func(*args, **kwargs):
      '''automatically unquote argument *unquotee*'''
      if kwargs.has_key(unquotee):
        kwargs[unquotee] = unquote(kwargs[unquotee])

      return f(*args, **kwargs)
    return func
  return decorated


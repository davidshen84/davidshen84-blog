# coding=utf-8

from flask import abort
from functools import partial, wraps
from google.appengine.api import users

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
    if users.is_current_user_admin():
      return f(publishedOnly=False)
    else:
      return f(publishedOnly=True)
  return func
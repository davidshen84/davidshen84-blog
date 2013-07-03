# coding=utf-8

from google.appengine.api import users

def is_admin():
  return users.is_current_user_admin()

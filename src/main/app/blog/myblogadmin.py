# coding=utf-8

import logging
import re

from flask import redirect
from google.appengine.api import users
from app import app

@app.route('/blog/admin/logout')
def logout():
  return redirect(users.create_logout_url('/blog'))

# coding=utf-8

import logging
import re

from flask import redirect, render_template
from google.appengine.api import users

def logout():
  return redirect(users.create_logout_url('/blog'))

def default():
  return render_template("admin/admin.html", title="Admin")

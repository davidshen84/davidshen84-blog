# coding=utf-8

import logging
import re

from flask import Flask, render_template, redirect
from google.appengine.api import users

app = Flask(__name__)

@app.route('/blog/admin/logout')
def logout():
  return redirect(users.create_logout_url('/blog'))

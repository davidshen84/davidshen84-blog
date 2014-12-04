# -*- coding: utf-8-unix -*-

import logging
import re

from flask import Blueprint, redirect, render_template
from blog.module import is_admin

myblogadmin = Blueprint('myblogadmin', __name__, url_prefix='/blog')

def logout():
  return redirect(users.create_logout_url('/blog'))

@myblogadmin.route('/admin')
def default():
  return render_template("admin/admin.html",
                         title="Admin",
                         isAdmin=is_admin(),
                         activePill="admin")

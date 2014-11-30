# -*- coding: utf-8-unix -*-

import logging
import re

from flask import redirect, render_template
from blog.modules import is_admin

def logout():
  return redirect(users.create_logout_url('/blog'))

def default():
  return render_template("admin/admin.html",
                         title="Admin",
                         isAdmin=is_admin(),
                         activePill="admin")

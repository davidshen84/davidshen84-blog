# coding=utf-8

import logging
import re

from flask import redirect, render_template
from . import is_admin

def logout():
  return redirect(users.create_logout_url('/blog'))

def default():
  return render_template("admin/admin.html",
                         title="Admin",
                         isAdmin=is_admin(),
                         activePill="admin")

# -*- coding: utf-8-unix -*-

from flask import Blueprint, redirect, render_template
from google.appengine.api import users

from blog.controller import is_admin

blueprint = Blueprint('myblogadmin', __name__, url_prefix='/blog')
route = blueprint.route


def logout():
    return redirect(users.create_logout_url('/blog'))


@route('/admin/')
def default():
    return render_template("admin/admin.html",
                           title="Admin",
                           isAdmin=is_admin(),
                           activePill="admin")

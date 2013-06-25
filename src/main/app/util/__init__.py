# coding=utf-8

from flask import render_template

def default():
  return render_template("util/util.html", title="Utilities")

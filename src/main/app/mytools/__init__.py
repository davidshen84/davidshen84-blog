# coding=utf-8

from flask import render_template

def default():
  return render_template("mytools/mytools.html",
                         title="My Tools",
                         activePill="mytools")

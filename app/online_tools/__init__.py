from google.appengine.ext import vendor

vendor.add('lib')

if True:
    from flask import Flask, Blueprint, render_template

debug_flag = True
app = Flask(__name__)
app.debug = debug_flag

online_tools = Blueprint('online_tools', __name__, url_prefix='/online_tools')
route = online_tools.route


@route('/')
def index():
    return render_template('index.html')

app.register_blueprint(online_tools)

import os

from flask import Flask

from resources import datastoreapi

app = Flask(__name__)
app.debug = os.environ['debug'] == 'True'
# app.register_blueprint(bloglist.blueprint)
# app.register_blueprint(blog.blueprint)
# app.register_blueprint(comment.blueprint)
app.register_blueprint(datastoreapi.bp)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)

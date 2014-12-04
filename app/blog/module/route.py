# coding=utf-8

from blog.module import myblog, myblogadmin, myblogapi, mycommentapi

def add_app_url_rule(app):
  # blog route
  app.add_url_rule('/blog/', 'default', myblog.default)
  app.add_url_rule('/blog/<int:year>/<int:month>/<urlsafe>', 'blog', myblog.blog)
  app.add_url_rule('/blog/<int:year>/', 'archive by year', myblog.archivesByDate)
  app.add_url_rule('/blog/<int:year>/<int:month>/', 'archive by year month', myblog.archivesByDate)
  # app.add_url_rule('/blog/tag/', 'tag default', myblog.archivesByTags, defaults={'tag': None})
  app.add_url_rule('/blog/tag/<tag>/', 'tag', myblog.archivesByTags)

  #admin
  #app.add_url_rule('/blog/admin/logout', 'admin logout', myblogadmin.logout)
  app.add_url_rule('/blog/admin/', 'admin', myblogadmin.default)

def add_api_url_rule(api):
  #blog api route
  api.add_url_rule('/blog/api/', 'index', myblogapi.index)
  api.add_url_rule('/blog/api/sync', 'query', myblogapi.query)
  api.add_url_rule('/blog/api/sync/<urlsafe>', 'fetch', myblogapi.fetch)
  api.add_url_rule('/blog/api/sync', 'create blog', myblogapi.create, methods=['POST'])
  api.add_url_rule('/blog/api/sync/<urlsafe>', 'update blog', myblogapi.update, methods=['PUT'])
  api.add_url_rule('/blog/api/sync/<urlsafe>', 'delete blog', myblogapi.destroy, methods=['DELETE'])
  api.add_url_rule('/blog/api/syncpub/<urlsafe>', 'publish blog', myblogapi.publish, methods=['PUT'])
  api.add_url_rule('/blog/api/archives', 'archives', myblogapi.archives)

  #blog comment api
  api.add_url_rule('/blog/comment/api/sync/<urlsafe>', 'get comment', mycommentapi.query)
  api.add_url_rule('/blog/comment/api/sync/<urlsafe>', 'save comment', mycommentapi.create, methods=['POST'])
  api.add_url_rule('/blog/comment/api/sync/<urlsafe>', 'destroy comment', mycommentapi.destroy, methods=['DELETE'])

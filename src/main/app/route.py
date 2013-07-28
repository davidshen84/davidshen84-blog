# coding=utf-8

from blog import myblog, myblogadmin, myblogapi, mycommentapi
import myutils

def add_url_rule(app):
  # blog route
  app.add_url_rule('/blog/', 'default', myblog.default)
  app.add_url_rule('/blog/<int:year>/<int:month>/<title>', 'blog', myblog.blog)
  app.add_url_rule('/blog/<int:year>/', 'archive by year', myblog.archivesByDate)
  app.add_url_rule('/blog/<int:year>/<int:month>/', 'archive by year month', myblog.archivesByDate)
  app.add_url_rule('/blog/tag/', 'tag default', myblog.archivesByTags, defaults={'tag': None})
  app.add_url_rule('/blog/tag/<tag>/', 'tag', myblog.archivesByTags)

  #blog api route
  app.add_url_rule('/blog/api/', 'index', myblogapi.index)
  app.add_url_rule('/blog/api/sync', 'query', myblogapi.query)
  app.add_url_rule('/blog/api/sync/<title>', 'fetch', myblogapi.fetch)
  app.add_url_rule('/blog/api/sync', 'create blog', myblogapi.create, methods=['POST'])
  app.add_url_rule('/blog/api/sync/<title>', 'update blog', myblogapi.update, methods=['PUT'])
  app.add_url_rule('/blog/api/sync/<title>', 'delete blog', myblogapi.destroy, methods=['DELETE'])
  app.add_url_rule('/blog/api/syncpub/<title>', 'publish blog', myblogapi.publish, methods=['PUT'])
  app.add_url_rule('/blog/api/archives', 'archives', myblogapi.archives)

  #blog comment api
  app.add_url_rule('/blog/comment/api/sync/<title>', 'get comment', mycommentapi.query)
  app.add_url_rule('/blog/comment/api/sync/<title>', 'save comment', mycommentapi.create, methods=['POST'])
  app.add_url_rule('/blog/comment/api/sync/<int:id>', 'destroy comment', mycommentapi.destroy, methods=['DELETE'])

  #admin
  #app.add_url_rule('/blog/admin/logout', 'admin logout', myblogadmin.logout)
  app.add_url_rule('/blog/admin/', 'admin', myblogadmin.default)

  #myutils
  app.add_url_rule('/utils/', 'my utils', myutils.default)

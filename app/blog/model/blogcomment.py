from google.appengine.ext import ndb


class BlogComment(ndb.Model):
    """
    BlogComment

    :`screen_name` (str): commenter's screen name
    :`email` (str): commenter's email address
    :`created` (date): date when the comment is created
    :`comment` (str): the comment content
    """
    screen_name = ndb.StringProperty(required=True)
    email = ndb.StringProperty(required=True)
    created = ndb.DateProperty(auto_now_add=True)
    comment = ndb.TextProperty(required=True)

    @classmethod
    def create(cls, blog_key, screen_name, email, comment):
        comment = cls(parent=blog_key, screen_name=screen_name, email=email, comment=comment)

        return comment.put()

    @classmethod
    def get_comments(cls, blog_key):
        comments = cls.query(ancestor=blog_key)

        return comments

    @classmethod
    def destroy(cls, urlsafe):
        ndb.Key(urlsafe=urlsafe).delete()

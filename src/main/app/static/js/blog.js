function redirectLinks() {
  'use strict';

  // redirect links in breadcrumbs
  $('#breadcrumbs > ul a[href]')
    .click(function (e) {
      var href = $(this).attr('href');
      window.router.navigate(href, {trigger: true});

      e.preventDefault();
    });

  // redirect links in blog post
  // only relative links should be redirected
  $("#article a[href]")
    .filter(function () {
      return !/^http/i.test($(this).attr('href'));
    })
    .click(function (e) {
      window.router.navigate($(this).attr('href'), {trigger: true});

      e.preventDefault();
    });
}

// :data: a jQuery object
// :showComment: control the visibility of the commants and the add comment form
function updatePage(data, showComment) {
  'use strict';

  var title = data.filter('title').text(),
    nav = data.filter('#nav'),
    article = data.filter('article'),
    comments = data.filter('#comments');

  // update page title
  $('#title').text(title);
  // update window title
  document.title = title;

  // update breadcrumb
  $('#breadcrumbs').html(nav);

  // update article
  $('#article').html(article);

  // update comments
  $('#comments').html(comments.html());

  if (showComment) {
    $('#comments').show();
    $('#addcommentform').show();
  } else {
    $('#comments').hide();
    $('#addcommentform').hide();
  }
}

$(function () {
  'use strict';

  var BlogRouter, BlogComment, BlogAddCommentFormView, addComment;

  BlogRouter = Backbone.Router.extend({
    routes: {
      'about': function () {/*nothing yet!*/},
      ':year/:month/:title': 'blog',
      ':year/:month/': 'archives',
      ':year/:month': 'archives',
      ':year/': 'archives',
      ':year': 'archives'
    },
    //initialize: function (options) {/*nothing yet!*/},
    blog: function (year, month, title) {
      if (isInitialized) {
        $.get(year + '/' + month + '/' + encodeURIComponent(title), null,
          function (data, textStatus) {
            updatePage($(data), true);
            redirectLinks();
          });
      } else {
        redirectLinks();
        isInitialized = true;
      }
    },
    archives: function (year, month) {
      if (isInitialized) {
        // get archive data
        var path = year + '/' + (month !== undefined ? (month + '/') : '');

        $.get(path, null,
          function (data, textStatus) {
            updatePage($(data), false);
            redirectLinks();
          });
      } else {
        redirectLinks();
        isInitialized = true;
      }
    }
  });

  BlogComment = Backbone.Model.extend({
    urlRoot: 'comment/api/sync',
    defaults: {
      blogtitle: '',
      screenname: '',
      email: '',
      comment: ''
    }
  });

  BlogAddCommentFormView = Backbone.View.extend({
    model: new BlogComment(),
    commentel: $('#comments'),
    commentTemplate: _.template('<dt><em>{{ screenname }}</em> on {{ created }}:</dt><dd class="well">{{ comment }}</dd>'),
    events: {
      'click .clear': 'clear'
    },
    initialize: function () {
      var view = this;

      this.validator = this.$el.validate({
        rules: {
          screenname: {
            required: true,
            minlength: 2
          },
          email: {
            required: true,
            email: true
          },
          comment: {
            required: true
          }
        },
        submitHandler: function (form) {
          view.save();
        }
      });
    },
    save: function () {
      var view = this,
        model = this.model,
        newComment = null,
        // update client
        children = this.commentel.children(),
        date = new Date(),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        dateOfMonth = date.getDate() + 1,
        il = null;

      // update to the server
      model.save({
        'blogtitle': $('#title').attr('keyname'),
        'screenname': this.$('#screenname').val(),
        'email': this.$('#email').val(),
        'comment': this.$('#comment').val()
      }, {
        error: function (model, response) {
          if (newComment) {
            newComment.remove();
          }
        }
      });

      // create view
      month = month < 10 ? '0' + month : month;
      dateOfMonth = dateOfMonth > 10 ? dateOfMonth : '0' + dateOfMonth;
      il = this.commentTemplate(
        {
          'email': this.model.get('email'),
          'screenname': model.get('screenname'),
          'comment': model.get('comment'),
          'created': year + '-' + month + '-' + dateOfMonth
        }
      );

      this.commentel.append(il);
      newComment = this.commentel.children().last();
    },
    clear: function () {
      this.$('input').val('');
      this.$('textarea').val('');
      this.validator.resetForm();
    }
  });

  addComment = new BlogAddCommentFormView({el: $('#addcommentform form').get(0)});

  window.router = new BlogRouter();
  Backbone.history.start({pushState: true, root: refbase});
});

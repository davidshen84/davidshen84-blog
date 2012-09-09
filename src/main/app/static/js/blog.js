function redirectLinks() {
  // redirect links in breadcrumbs
  $('#breadcrumbs > ul a[href]')
  .click(function(e)
  {
    var href = $(this).attr('href');
    router.navigate(href, {trigger: true});

    e.preventDefault();
  });

  // redirect links in blog post
  // only relative links should be redirected
  $("#article a[href]")
  .filter(function() {
    return !/^http/i.test($(this).attr('href'));
  })
  .click(function(e) {
    router.navigate($(this).attr('href'), {trigger: true});

    e.preventDefault();
  });
}

/*function updateUI(title, content) {
  // update browser title
  document.title = title;

  // update page title
  $('#title').text(title);

  // update breadcrumbs navigation
  var path = window.location.pathname;
  path = path.substr(1); // strip the leading slash
  if(path[path.length-1] == '/') // and the ending slash
    path = path.substr(0, path.length-1);

  // build breadcrumbs items
  var pathsplit = path.split('/');
  var pathmapping = new Array();
  for(var i=0; i<pathsplit.length; i++) {
    var t = '';
    for(var j=0; j<=i; j++) {
      t += '/' + pathsplit[j];
    }
    pathmapping[i] = {key: pathsplit[i], value: t};
  }

  var template = _.template(
    "{% _.each(p, function(e, i, l) {\
      if(i!=l.length-1) { %}\
<li><a href=\"{{e.value}}\">{{e.key}}</a><span class=\"divider\">/</span></li>\
{% } else { %}\
<li class=\"active\">{{e.key}}</li>\
      {% }}); %}");

  $('nav > ul').html(template({p: pathmapping}));

  // update content
  $('#content').html(content);

  // bind route events
  redirectLinks();
}*/

/*function contentFromArchives(archives, year, month) {
  var content = null;

  if(month === undefined) {
  // filter by year only
    var template = _.template(
      "{% _.each(a[y], function(titles, m) { %}\
{{m}}\n\n\
{% _.each(titles, function(t) { %}\
- [{{t}}](/blog/{{y}}/{{m}}/{{t}})\n\
{% });}) %}");
    content = converter.makeHtml(template({a: archives, y: year}));
  } else {
    // filter by year and month
    var template = _.template("{%_.each(a[y][m], function(t) {%}- [{{t}}](/blog/{{y}}/{{m}}/{{t}})\n{%});%}");

    content = template({a: archives, y: year, m: month});
  }

  return content;
}*/

// :data: a jQuery object
// :showComment: control the visibility of the commants and the add comment form
function updatePage(data, showComment) {
  var title = data.filter('title').text();
  var nav = data.filter('#nav');
  var article = data.filter('article');
  var comments = data.filter('#comments');

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
  
  if(showComment) {
    $('#comments').show();
    $('#addcommentform').show();
  } else {
    $('#comments').hide();
    $('#addcommentform').hide();
  }
}

$(function(){
  var BlogRouter = Backbone.Router.extend({
    routes: {
      'about': function() {/*nothing yet!*/},
      ':year/:month/:title': 'blog',
      ':year/:month/': 'archives',
      ':year/:month': 'archives',
      ':year/': 'archives',
      ':year': 'archives' },
    //initialize: function(options) {/*nothing yet!*/},
    blog: function(year, month, title) {
      if(isInitialized) {
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
    archives: function(year, month) {
      if(isInitialized) {
        // get archive data
        var path = year + '/' + (month != undefined ? (month + '/') : '');

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

  window.router = new BlogRouter();
  Backbone.history.start({pushState: true, root: refbase});

  var BlogComment = Backbone.Model.extend(
  {
    urlRoot: 'comment/api/sync',
    defaults: {
      blogtitle: '',
      screenname: '',
      email: '',
      comment: ''
    }
  });

  var BlogAddCommentFormView = Backbone.View.extend(
  {
    model: new BlogComment(),
    commentel: $('#comments'),
    commentTemplate: _.template('<dt>{{ screenname }}:</dt><dd>{{ comment }}</dd>'),
    events: {
      'click .clear': 'clear'
    },
    initialize: function() {
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
        submitHandler: function(form) {
          view.save();
        }
      });
    },
    save: function() {
      var view = this;
      var model = this.model;

      // update to the server
      var newComment = null;
      model.save(
      {
        'blogtitle': $('#title').attr('keyname'),
        'screenname': this.$('#screenname').val(),
        'email': this.$('#email').val(),
        'comment': this.$('#comment').val()
      },
      {
        error: function(model, response) {
          if(newComment) {
            newComment.remove();
          }
        }
      });

      // update client
      var children = this.commentel.children();
      var il = this.commentTemplate(
      {
        'email': this.model.get('email'),
        'screenname': model.get('screenname'),
        'comment': model.get('comment')
      });

      this.commentel.append(il);
      newComment = this.commentel.children().last();
    },
    clear: function() {
      this.$('input').val('');
      this.$('textarea').val('');
      this.validator.resetForm();
    }
  });

  new BlogAddCommentFormView({el: $('#addcommentform form').get(0)});
});
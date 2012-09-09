$(function() {
  // set defaults for underscore.js
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /\{\%(.+?)\%\}/g
  };
  
  var Blog = Backbone.Model.extend(
  {
    defaults: {
      title: 'empty',
      content: '#empty\n\ncontent',
      tags: [],
      published: false,
      created: null,
      lastmodified: null },
    initialize: function() {
      this.on('change:tags', function() {
        var tags = this.get('tags');
        if (typeof tags == 'string') {
          tags = tags.split(',');
          this.set('tags', tags);
        }});
    },
    urlRoot: 'api/sync',
    publish: function(success) {
      this.set('published', !this.get('published'));
      $.ajax({
        type: 'PUT',
        url: this.urlRoot + 'pub/' + encodeURIComponent(this.get('id')),
        data: { published: this.get('published') },
        contentType: 'application/x-www-form-urlencoded',
        success: success });
    }
  });

  var BlogComment = Backbone.Model.extend({
    defaults: {
      id: '',
      blogtitle: '',
      screenname: '',
      email: '',
      comment: '',
      created: ''
    },
    urlRoot: 'comment/api/sync'
  });

  var BlogCommentsCollection = Backbone.Collection.extend({
    model: BlogComment,
    url: 'comment/api/collection',
    parse: function(response) {
      return response.comments;
    }
  });

  var BlogEditView = Backbone.View.extend({
    model: new Blog(),
    searchView: null,
    template: _.template('<label class=\"text\">Tags: <input type=\"text\" class=\"tags\" value="{{tags}}"/></label>\
                         <div class=\"btn-group pull-right\">\
                         <button type=\"button\" class=\"btn btn-primary" {{saved ? \'disabled\' : \'\'}} id=\"btnsave\">Save</button>\
                         <button type=\"button\" class=\"btn btn-danger\" id=\"btndel\" {{isnew ? \'disabled\' : \'\'}}>Delete</button>\
                         {% if(!published) { %}\
                         <button type=\"button\" class=\"btn\" id=\"btnpub\" {{!saved ? \'disabled\' : \'\'}} data-act=\"publish\">Publish</button>\
                         {% } else { %}\
                         <button type=\"button\" class=\"btn\" id=\"btnpub\" {{!saved ? \'disabled\' : \'\'}} data-act=\"unpublish\">Unpublish</button>\
                         {% } %}\
                         </div>'),
    alertTemplate: _.template("<div class='alert alert-{{type}}'>{{msg}}<a class='close' data-dismiss='alert'>x</a></div>"),
    render: function() {
      var view = this;
      // update content view
      this.ee.importFile(view.model.get('title'), view.model.get('content'));
      // update control statuses
      this.$('.controller').html(
        this.template(_.extend(
          view.model.toJSON(),
          {
            isnew: view.model.isNew(),
            saved: this['saved'] == true
          })));

      this.$('.tags').change(function() {
        var $this = $(this);
        view.model.set('tags', $this.val());
        view.saved = false;
        view.render();
      });

      return this;
    },
    titlePattern: /^#[^\n\r]*/,
    extractTitleFromContent: function(content) {
      return this.titlePattern.exec(content);
    },
    initialize: function() {
      var view = this;
      // associate editor view with search view
      view.options.searchView.editorView = view;

      // initialize the EE only once
      var editor = new EpicEditor({
          'container': this.$('.contentview').get(0),
          'basePath': 'static/epiceditor'
      });
      this.ee = editor;

      editor.load()
      .importFile(view.model.get('title'), view.model.get('content'))
      .preview()
      // bind save event
      .on('preview', function() {
        var content = editor.getElement('editor').body.innerText;
        view.model.set('content', content);
        view.saved = false;
        view.render();
      });
    },
    events: {
      'click #btnsave': 'save',
      'click #btnpub': 'togglePublish',
      'click #btndel': 'destroy'
    },
    save: function() {
      var view = this;
      var content = view.model.get('content');
      var title = view.extractTitleFromContent(content);

      if (title == null || title.length == 0) {
        alert('need title', 'error');
        return;
      }
      title = title[0].substr(1);

      view.model.save(
        { title: title },
        {
          success: function(model, response) {
            // sync. id with title
            model.set('id', model.get('title'));
            view['saved'] = true;
            view.render();
            view.alert('blog saved', 'success');
          }
        });
    },
    togglePublish: function() {
      var view = this;
      var publish = !this.model.get('published');
      this.model.publish(function(data, textStatus) {
        if (data.msg == 'ok') {
          view.render();
          if (publish) {
            view.alert('blog published', 'success');
          } else {
            view. alert('blog unpublished', 'success');
          }
        }
      });
    },
    destroy: function() {
      var view = this;
      view.model.destroy({
        success: function(model, response) {
          if (response.msg == 'ok') {
            view.model = new Blog();
            view.render();
            view.alert('blog destroied', 'success');
          }
        }});
    },
    alert: function(msg, type) {
      this.$el.prepend(this.alertTemplate({msg: msg, type: type}));
    }
  });

  var BlogSearchView = Backbone.View.extend({
      // model: new Blogs(),
      editorView: null,
      events: {
        'click .edit': 'edit',
        'click .new': 'new',
        'keypress .title': 'updateTypeahead' },
      updateUI: function() {
        // update type-ahead data source
        this.$('input').data('source', this.model.map(function (b) { return b.get('title'); }));
      },
      updateTypeahead: function(e) {
        var that = this;
        var title = $('.title').val();
        var working = false;

        if(title.length > 1 && !working) {
          working = true;
          $.get('api/titles?f=' + encodeURIComponent(title),
            null,
            function (data, textStatus) {
              that.$('.title').data('typeahead').source=data.titles;
              working = false;
            });
        }
      },
      edit: function() {
        var view = this.editorView;
        var title = this.$('input').val();
        
        new Blog({id: title})
        .fetch({
          success: function(model, response) {
            view.model = model;
            view.saved = true;
            view.render();

            // fetch comments
            commentsView.setBlogTitle(title);
          }
        });
      },
      new: function() {
        this.editorView.model = new Blog();
        this.editorView.saved = false;
        this.editorView.render();
      }
    });

  var BlogCommentsView = Backbone.View.extend({
    model: new BlogCommentsCollection(),
    blogTitle: '',
    template: _.template('<ul>{% _.each(comments, function(c) { %}\
      <li class="comment" id="{{ c.id }}">\
        <a class="label label-inverse pull-right" href="#">X</a>\
        <h4>{{ c.screenname }} on {{ c.created }}:</h4>\
        <p>{{ c.comment }}</p>\
      </li>\
      {% }); %}\
      </ul>'),
    render: function() {
      var model = this.model;

      this.$el.html(this.template({comments: this.model.toJSON()}));
      this.$('.comment').bind('close', function(e) {
        var $this = $(this);
        if(confirm('really?')) {
          var id = $this.attr('id');
          model.get(id).destroy();
          $this.remove();
        }
      }).children().filter('a').click(function(e) {
        $(this).parent().trigger('close');
      });
    },
    setBlogTitle: function(title) {
      var view = this;
      var model = this.model;

      this.blogTitle = title;
      model.fetch({
        data: {title: this.blogTitle},
        success: function(collection, response) {
          view.render();
        }
      });
    }
  });

  var searchView = new BlogSearchView({el: $('#searchview').get(0)});
  var editView = new BlogEditView({el: $('#viewcontainer').get(0), searchView: searchView}).render();
  var commentsView = new BlogCommentsView({el: $('#commentsview').get(0)});

  window.searchView = searchView;
});

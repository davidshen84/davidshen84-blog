$(function() {
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

  router = new BlogRouter();
  Backbone.history.start({pushState: true, root: refbase});
});
var templates = {};
$(function() {

  $('[type*="x-handlebars"]').each(function() {
    $template = $(this);
    templates[$template.attr('id')] = Handlebars.compile($template.html());  
  });

  Handlebars.registerPartial('event', $('#event').html());

  var Events = {
    collection: [],
    $el: $('#events_list'),

    sort: function() {
      this.collection.sort(function(a, b) {
        return b.date - a.date;
      });
    },

    render: function() {
      this.$el.html(templates.events({ events: this.collection }));
    },

    add: function(events) {
      var self = this;
      events = _(events).isArray() ? events : [events]

      events.forEach(function(event) {
        self.collection.push(event);
      });

      this.sort();
      this.render();
    },

    remove: function(id) {
      var model = _(this.collection).findWhere({id: id});

      if (!model) { return true; }

      this.collection = this.collection.filter(function(current_model) {
        return current_model.id !== model.id;
      });
      this.sort();
      this.render();
    },
  };

  $('form').on('submit', function(e) {
    e.preventDefault();
    var $f = $(this);

    $.ajax({
      url: $f.attr('action'),
      type: $f.attr('method'),
      data: $f.serialize(),
      success: function(event_json) {
        Events.add(event_json);
      }
    })
  });

  Events.$el.on('click', 'a.remove', function(e) {
    e.preventDefault();
    var id = +$(e.target).closest('li').attr('data-id');
    Events.remove(id);
    $.ajax({
      type: 'post',
      url: 'events/delete',
      data: 'id=' + id
    });
  });

  $.ajax({
    url: '/events',
    success: function(events_json) {
      Events.add(events_json);
    },
  });

});

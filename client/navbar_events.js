Template.navbar.events({
  'click .teams': function(e) {
    $link = $(e.currentTarget);
    $link.addClass('active');
    $link.prev().removeClass('active');
    Session.set('page_teams', true);
  },
  'click .ideas': function(e) {
    $link = $(e.currentTarget);
    $link.addClass('active');
    $link.next().removeClass('active');
    Session.set('page_teams', false);
  },
});

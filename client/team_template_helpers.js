//
// Team Template Helpers

Template.teams.helpers({
  teams: function(){
    return Teams.find({});
  },

  ownerInfo: function() {
    if (this.owner.profile && this.owner.services) {
      str = this.owner.profile.name + ' <img src="' + this.owner.services.google.picture + '" style="border-radius: 50%; width: 30px; height:30px;">';
    } else {
      str = this.owner;
      Meteor.call('changeOwner', this, this.owner);
    }
    return new Handlebars.SafeString(str);
  },

  isOwner: function(){
    let superpowers = Session.get('admins');
    if (superpowers && Meteor.user()) {
      superpowers.push(this.owner.services && this.owner.services.google.email || this.owner);
      return superpowers.includes(Meteor.user().services.google.email);
    }
  },

  isAdmin: function(){
    if(Session.get("admins")){
      return Session.get('admins').includes(Meteor.user().services.google.email);
    }
  },
});

Template.teams.events({
  'submit #form': function (e) {
    e.preventDefault();
    var $input = $('#form input'),
    teamName = $input.val();

  if (teamName) {
      const user = Meteor.user();
      TeamApp.createTeam(teamName, user);
      $input.val('');
    }
  },

  'click .team-name': function(e) {
    const $input = $(e.currentTarget).find('.name');
    if (Session.get('admins').concat(this.owner.services.google.email).includes(Meteor.user().services.google.email)) {
      $input.parent().prev('h4').addClass('hide');
      $input.removeClass('hide');
      $input.val(this.name);
    }
  },

  'keyup .name': function(e) {
    const $input = $(e.currentTarget);
    if (e.keyCode === 13) {
      TeamApp.addName(this, $input.val());
      $input.addClass('hide');
      $input.parent().prev('h4').removeClass('hide');
    }
  },

  'click .owner-info': function(e) {
    if (Session.get('admins').includes(Meteor.user().services.google.email)) {
      const $input = $(e.currentTarget).next('.owner-input');
      $(e.currentTarget).addClass('hide');
      $input.removeClass('hide');
      $input.val(this.owner.services.google.email);
    }
  },

  'keyup .owner-input': function(e) {
    const $input = $(e.currentTarget);
    if ([13, 27].includes(e.keyCode)) {
      if (e.keyCode === 13) {
        TeamApp.changeOwner(this, $input.val());
      }
      $input.addClass('hide');
      $input.prev('.owner-info').removeClass('hide');
    }
  },

  'click .team-description': function(e) {
    const $input = $(e.currentTarget).find('.description');
    if (Session.get('admins').concat(this.owner.services.google.email).includes(Meteor.user().services.google.email)) {
      $input.prev('p').addClass('hide');
      $input.removeClass('hide');
      $input.val(this.description);
    }
  },

  'keyup .description': function(e) {
    const $input = $(e.currentTarget);
    if (e.keyCode === 13) {
      TeamApp.addDescription(this, $input.val());
      $input.addClass('hide');
      $input.prev('p').removeClass('hide');
    }
  },

  'click .delete': function(e) {
    var user = Meteor.user();
    if (user) {
      TeamApp.deleteTeam(this, user);
    }
    return false;
  },

  'click .vote-button' : function(e){
    e.preventDefault();
    if(Meteor.user()){
      var $btn = $(e.target),
        user = Meteor.user();

      if(e.target.tagName.toLowerCase !== 'button'){
        $btn = $btn.closest('button');
      }

      if($btn.hasClass('down')){
        TeamApp.leaveTeam(this, user);
      } else {
        TeamApp.joinTeam(this, user);
      }
    }
    return false;
  },

});

//
// Event Helper methods functions
var TeamApp = {

  addName: function(team, name) {
    Teams.update({ _id: team._id }, { $set : { name: name } });
  },

  addDescription: function(team, description) {
    Teams.update({ _id: team._id }, { $set : { description: description } });
  },

  createTeam: function(name, user) {
    var teamExists = Teams.findOne({name: name});
    var ownerTeamExists = Teams.findOne({owner: user});
    // Check if user has joined a team
    if (teamExists) {
      alert('This team name already exists!');
    } else if (ownerTeamExists) {
      alert('You have already created a team: ' + ownerTeamExists.name);
    } else {
      Teams.insert({name: name, owner: user});
    }
  },

  joinTeam: function(team, user) {
    var team = Teams.findOne({ _id: team._id });
    if (team.members && team.members.length > 5) {
      alert ('Team has reached max users!');
    } else if (team.owner._id === user._id) {
      alert ('You cannot join your own team!');
    } else {
      Teams.update({ _id: team._id, }, { $push: { members: user } });
    }
  },

  leaveTeam: function(team, user) {
    var team = Teams.findOne({ _id: team._id });
    if (team.owner._id === user._id) {
      alert('You cannot leave your own team!');
    } else {
      Teams.update({ _id: team._id, }, { $pull: { members: user } });
    }
  },

  deleteTeam: function(team, user) {
    Teams.remove({ _id: team._id });
  },
};

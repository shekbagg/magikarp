//
// Vote Template Helpers

Template.vote.helpers({


	isAdmin : function(){
		if(Meteor.user()){
			return Meteor.user().isAdmin;
		}
	},

	activeUsers : function(){
		if( Meteor.user() ){
			var returnArr = [];

			Meteor.users.find().forEach(function(user){
				var nameArr = user.profile.name.split(' ');
				returnArr.push( {name : nameArr[0] + ' ' + nameArr[1].substr(0, 1) } );
			});

			return returnArr;
		}
	},

	nominees : function(){
		return Nominees.find({}, {sort : [['name', 'asc']]});
	},

	results : function(){
		return Nominees.find({}, {sort : [['votes', 'desc']]});
	},

	title : function(){
		var setting = Settings.findOne({name : 'title'});

		if(setting){
			return setting.value;
		}	else {
		return 'Vote on...';
		}
	},

	votesPerUser : function(){
		var setting = Settings.findOne({name : 'votesPerUser'});

		if(setting){
			return setting.value;
		} else {
			return 5;
		}

	},

	allowDownVotes : function(){
		var setting = Settings.findOne({name : 'allowDownVotes'});

		if(setting){
			return setting.value;
		} else {
			return true;
		}

	},

	userVotes : function(){
		if(Meteor.user()){
			return Meteor.user().votes;
		}
	},

	canVote : function(){
		if(Session.get("meteor_loggedin")){
			return Meteor.user().votes > 0;
		} else {
			return false;
		}
	},

	canDelete: function(){
		return [Meteor.user().services.google.email].includes(this.nominator.services.google.email);
	},

	canVoteUp : function(){
		if(Session.get("meteor_loggedin")){
			var user = Meteor.user(),
			nomineeVotes = NomineeVotes.findOne({nominee : this._id, user : user._id});

			if(user.votes > 0 ) return true;

			if(nomineeVotes && nomineeVotes.votes < 0){
				return true;
			} else {
				return false;
			}
		} else {
			return false
		}
	},

	canVoteDown : function(){
		if(Session.get("meteor_loggedin")){
			var user = Meteor.user(),
				nomineeVotes = NomineeVotes.findOne({nominee : this._id, user : user._id}),
				allowDownVotesSetting = Settings.findOne({name : 'allowDownVotes'});

			if(nomineeVotes.votes < 1 && !allowDownVotesSetting.value){
				return false;
			}

			if(user.votes > 0 ) return true;

			if(nomineeVotes && nomineeVotes.votes >=1){
				return true;
			} else {
				return false;
			}

		} else {
			return false;
		}
	},

	totalVotesForNominee: function() {
		var str = '',
		total = 0,
		user = Meteor.user();

		if(user){
			var nomineeVotesList = NomineeVotes.find({ nominee: this._id });
			nomineeVotesList.forEach(function(nomineeVotes) {
				return total += nomineeVotes.votes;
			});
		} else {
			return null;
		}
		return total;
	},


	userVotesForNominee : function(){
		var str = '',
		user = Meteor.user();

		if(user){
			var nomineeVotesList = NomineeVotes.find({ nominee: this._id });
		} else {
			return null;
		}

		nomineeVotesList.forEach(function(nomineeVotes) {
			const votesTotal = nomineeVotes.votes;
			const user = Meteor.users.findOne({ _id: nomineeVotes.user });
			if (votesTotal !== 0) {
				str += '<img src="' + user.services.google.picture + '" title="' + user.profile.name + ': ' + votesTotal + ' votes" style="border-radius: 50%; width: 30px; height:30px;">';
			}
		});

		return new Handlebars.SafeString(str);
	},

	voters : function(){
		return Users = Users.find({}, {sort : [['name', 'asc']]});
	},

});


//
// Handlebars Helpers
Handlebars.registerHelper('session',function(input){
	return Session.get(input);
});

Handlebars.registerHelper('votesCast',function(votesRemaining){

	var votesPerUser = Settings.findOne({name : 'votesPerUser'});

	return votesPerUser.value - votesRemaining;

});

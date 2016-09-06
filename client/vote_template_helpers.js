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


	userVotesForNominee : function(){
		var str = '',
		user = Meteor.user();

		if(user){
			var nomineeVotes = NomineeVotes.findOne({nominee : this._id, user : user._id});
		} else {
			return null;
		}

		if(!nomineeVotes){
			return null;
		}

		var votesTotal = nomineeVotes.votes;


		for (var i = 0; i < Math.abs(votesTotal); ++i) {
			if(votesTotal < 0){
				str += '<p class="up"><i class="fa fa-thumbs-o-down"></i></p>';
			} else {
				str += '<p class="down"><i class="fa fa-thumbs-o-up"></i></p>';
			}
		}

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

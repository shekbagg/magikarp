//
// Template Events
Template.vote.events({
	'submit #form': function (e) {
		e.preventDefault();
		var $input = $('#form input'),
		val = $input.val();

	if(val){
			const user = Meteor.user();
			var nomineeId = Nominees.insert({name : $input.val(), votes : 1, nominator: user}),
				nominee = {_id : nomineeId};

			VoteApp.increaseNomineeVotes(nominee, user);
			$input.val('');
		}
	},

	'click #reset' : function(e){
		if(Meteor.user().isAdmin){
			var voteSetting = Settings.findOne({name : 'votesPerUser'}),
				allowDownVoteSetting = Settings.findOne({name : 'allowDownVotes'});

			Settings.update({_id : voteSetting._id}, {$set : {value : parseInt($('#numbervotes').val(), 10) }});
			Settings.update({_id : allowDownVoteSetting._id}, {$set : {value : ($('#allowdownvotes').is(':checked') ? true : false) }});
			Meteor.call('reset');

			$('#results, #changevotes').addClass('hide');
			$('#ballot, #viewresults').removeClass('hide');

		}
	},

	'click .nominee': function(e) {
		const $input = $(e.currentTarget).find('.description');
		if (this.nominator._id === Meteor.user()._id) {
			$input.prev('p').addClass('hide');
			$input.removeClass('hide');
			$input.val(this.description);
		}
	},

	'keyup .description': function(e) {
		const $input = $(e.currentTarget);
		if (e.keyCode === 13) {
			if ($input.val()) {
				VoteApp.addDescription(this, $input.val());
			}
			$input.addClass('hide');
			$input.prev('p').removeClass('hide');
		}
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
				VoteApp.voteDownNominee(this);
				VoteApp.decreaseNomineeVotes(this, user);
				change = -1;
			} else {
				VoteApp.voteUpNominee(this);
				VoteApp.increaseNomineeVotes(this, user);
			}

		}
		return false;
	},

	'click .delete': function(e) {
		var user = Meteor.user();
		if (user) {
			VoteApp.removeNominee(this, user);
		}
		return false;
	},

	'blur #title' : function(){
		if(Meteor.user().isAdmin){
			var $title = $('#title'),
				val = $title.text().trim(),
				setting = Settings.findOne({name : 'title'});

			if(setting){
				Settings.update({_id : setting._id}, {$set : {value : val}});
			} else {
				Settings.insert({name : 'title', value : val});
			}
		}
	},

	'click .discardBallot' : function(){
		if(Meteor.user().isAdmin){

			var service = "";

			if(this.services.facebook){
				service = 'Facebook';
			} else if(this.services.twitter){
				service = 'Twitter';
			} else if(this.services.google){
				service = 'Google';
			}

			var answer = confirm("Are you sure you want to discard " + this.profile.name + "'s "  + service + " Account ballot?");

			if(answer){
				Meteor.call('discardBallot', this._id);
			}
		}
	},

	'click #viewresults': function(){

		$('#results, #changevotes').removeClass('hide');
		$('#ballot, #viewresults').addClass('hide');

		setTimeout(function(){
			$('html, body').stop().animate({scrollTop: $('#results').offset().top}, 500);
		}, 10);

	},

	'click #changevotes': function(){

		$('#results, #changevotes').addClass('hide');
		$('#ballot, #viewresults').removeClass('hide');

		setTimeout(function(){
			$('html, body').stop().animate({scrollTop: $('#ballot').offset().top}, 500);
		}, 10);

	}

});


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

	userVotes: function(){
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
			nomineeVotes = NomineeVotes.findOne({nominee : this._id, user : user._id});

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

	voters : function(){
		return Users = Users.find({}, {sort : [['name', 'asc']]});
	},

});

//
// Event Helper methods functions
var VoteApp = {

	addDescription: function(nominee, description) {
		Nominees.update({ _id: nominee._id }, { $set : { description: description } });
	},

	 voteUpNominee : function(nominee){
		Nominees.update({_id : nominee._id},{$set : {votes: (nominee.votes + 1)}});
	},

	voteDownNominee : function(nominee){
		Nominees.update({_id : nominee._id},{$set : {votes: (nominee.votes - 1)}});
	},

	removeNominee: function(nominee, user) {
		Nominees.remove({ _id: nominee._id });
		var nomineeVotesList = NomineeVotes.find({nominee : nominee._id});
		if (nomineeVotesList.count()) {
			let length = 0;
			nomineeVotesList.forEach(function(nomineeVotes) {
				console.log(++length);
				console.log(nomineeVotes)
				NomineeVotes.remove({ _id: nomineeVotes._id });
				VoteApp.clearUserVote(nomineeVotes.user, nomineeVotes.votes);
			});
		}
	},

	clearUserVote: function(user, votes){
		Meteor.call('clearUserVote', user, votes);
	},

	removeUserVote : function(user){
		Meteor.call('removeUserVote');
	},

	addUserVote : function(user){
		Meteor.call('addUserVote');
	},

	decreaseNomineeVotes : function(nominee, user){
		var nomineeVotes = NomineeVotes.findOne({nominee : nominee._id, user : user._id});

		if(nomineeVotes){
			NomineeVotes.update({_id : nomineeVotes._id}, {$set : {votes : (nomineeVotes.votes  - 1 )}});
		} else {
			var id = NomineeVotes.insert({nominee : nominee._id, user: user._id, votes : -1});
			nomineeVotes = NomineeVotes.findOne({_id : id });
		}

		if(nomineeVotes.votes <= 0){
			VoteApp.removeUserVote();
		} else {
			VoteApp.addUserVote();
		}
	},

	increaseNomineeVotes : function(nominee, user){
			var nomineeVotes = NomineeVotes.findOne({nominee : nominee._id, user : user._id});

		if(nomineeVotes){
			NomineeVotes.update({_id : nomineeVotes._id}, {$set : {votes : (nomineeVotes.votes  + 1 )}});
		} else {
			var id = NomineeVotes.insert({nominee : nominee._id, user: user._id, votes : 1});
			nomineeVotes = NomineeVotes.findOne({_id : id });
		}

		if(nomineeVotes.votes >= 0){
			VoteApp.removeUserVote();
		} else {
			VoteApp.addUserVote();
		}
	}
};

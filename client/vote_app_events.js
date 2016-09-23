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

	'click .popular': function(e) {
			Session.set('sortPopular', true);
			var $button = $(e.currentTarget);
			$button.addClass('btn-primary');
			$button.next().removeClass('btn-primary');
	},

	'click .random': function(e) {
			Session.set('sortPopular', false);
			var $button = $(e.currentTarget);
			$button.addClass('btn-primary');
			$button.prev().removeClass('btn-primary');
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

	'click .nominator-info': function(e) {
		if (Session.get('admins').includes(Meteor.user().services.google.email)) {
			const $input = $(e.currentTarget).next('.nominator-input');
			$(e.currentTarget).addClass('hide');
			$input.removeClass('hide');
			$input.val(this.nominator.services.google.email);
		}
	},

	'keyup .nominator-input': function(e) {
		const $input = $(e.currentTarget);
		if ([13, 27].includes(e.keyCode)) {
			if (e.keyCode === 13) {
				VoteApp.changeNominator(this, $input.val());
			}
			$input.addClass('hide');
			$input.prev('.nominator-info').removeClass('hide');
		}
	},

	'click .idea-name': function(e) {
		const $input = $(e.currentTarget).find('.name');
		if (Session.get('admins').concat(this.nominator.services.google.email).includes(Meteor.user().services.google.email)) {
			$input.parent().prev('h4').addClass('hide');
			$input.removeClass('hide');
			$input.val(this.name);
		}
	},

	'keyup .name': function(e) {
		const $input = $(e.currentTarget);
		if (e.keyCode === 13) {
			VoteApp.addName(this, $input.val());
			$input.addClass('hide');
			$input.parent().prev('h4').removeClass('hide');
		}
	},

	'click .idea-description': function(e) {
		const $input = $(e.currentTarget).find('.description');
		if (Session.get('admins').concat(this.nominator.services.google.email).includes(Meteor.user().services.google.email)) {
			$input.prev('p').addClass('hide');
			$input.removeClass('hide');
			$input.val(this.description);
		}
	},

	'keyup .description': function(e) {
		const $input = $(e.currentTarget);
		if (e.keyCode === 13) {
			VoteApp.addDescription(this, $input.val());
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
// Event Helper methods functions
var VoteApp = {

	changeNominator: function(nominee, nominatorEmail) {
		Meteor.call('changeNominator', nominee, nominatorEmail);
	},

	addName: function(nominee, name) {
		Nominees.update({ _id: nominee._id }, { $set : { name: name } });
	},

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

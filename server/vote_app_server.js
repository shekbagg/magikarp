
 //
 // Set up Google Login on Startup
	Meteor.startup(function () {
		Accounts.loginServiceConfiguration.remove({
			service : 'google'
		});
		Accounts.loginServiceConfiguration.insert(Meteor.settings.googleSettings);
	});

	//
	// Server Methods
	Meteor.methods({
		onLogin: function() {
			var user = Meteor.user();
			if(!user){
				return null;
			}

			var	isAdmin = false,
				$set = {},
				voteSetting = Settings.findOne({name : 'votesPerUser'}),
				allowDownVoteSetting = Settings.findOne({name : 'allowDownVotes'});


			if(!voteSetting){
				Settings.insert({name : 'votesPerUser', value : 20});
				voteSetting = Settings.findOne({name : 'votesPerUser'});
			}

			if(!allowDownVoteSetting){
				Settings.insert({name : 'allowDownVotes', value : false});
				allowDownVoteSetting = Settings.findOne({name : 'allowDownVotes'});
			}

			if(typeof user.votes == 'undefined'){
				$set.votes = voteSetting.value;
			}

		  if(user.services.google){
				$set.profileLink = user.services.google.email;
			}

			$set.isAdmin = isAdmin;
			Meteor.users.update({_id:Meteor.user()._id}, { $set: $set });
		},
		reset : function(){
			if(Meteor.user().isAdmin){
				// Remove Nominees
				Nominees.remove({});
				// Remove Nominee Votes
				NomineeVotes.remove({});
				// Reset Title
				Settings.remove({name: 'title'});
				// Reset user votes
				Meteor.users.update({}, { $set: {votes : Settings.findOne({name : 'votesPerUser'}).value }}, {multi: true});
			}
		},
		getAdmins: function() {
			return Meteor.settings.admins;
		},
		addUserVote: function(){
			var user = Meteor.user();
			Meteor.users.update({_id : user._id},{$set : {votes: (user.votes + 1)}});
		},
		removeUserVote: function(){
			var user = Meteor.user();
			Meteor.users.update({_id : user._id},{$set : {votes: (user.votes - 1)}});
		},
		clearUserVote: function(user_id, votes) {
			var user = Meteor.users.findOne({ _id: user_id });
			Meteor.users.update({ _id: user_id }, {$set : {votes: (user.votes + votes)}});
		},
		changeNominator: function(nominee, nominatorEmail) {
			const newNominator = Meteor.users.findOne({ 'services.google.email': nominatorEmail });
			Nominees.update({ _id: nominee._id }, { $set : { nominator: newNominator || nominatorEmail } });
			return !!newNominator;
		},
		changeOwner: function(team, ownerEmail) {
			const newOnwer = Meteor.users.findOne({ 'services.google.email': ownerEmail });
			Teams.update({ _id: team._id }, { $set : { owner: newOnwer || ownerEmail } });
			return !!newOnwer;
		},
	});


	//
	// Publish isAdmin & votes field if searching by ID
	Meteor.publish('userData', function() {
		if(!this.userId) return null;
		return Meteor.users.find(this.userId, {fields: {
			isAdmin: 1,
			votes: 1
		}});
	});

	//
	// Publish votes and profileLink fields only to Admins
	Meteor.publish("allUserData", function () {

		var user = Meteor.users.findOne({_id : this.userId});
		if(!user || !user.isAdmin) return null;

		return Meteor.users.find({}, {fields: {
			votes: 1,
			profileLink: 1
		}});
	});

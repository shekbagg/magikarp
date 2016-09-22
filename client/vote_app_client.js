//
// Autorun functions
Deps.autorun(function() {
	Meteor.subscribe('userData');
	Meteor.subscribe('allUserData');
	Session.set("meteor_loggedin",!!Meteor.user());

	var user = Meteor.user();

	// Handle on Login
	if(Meteor.userId()){
		Meteor.call('onLogin');
		Meteor.call('getAdmins', function(err, admins) {
			Session.set("admins", admins);
		});

		console.log(Session.get("meteor_loggedin"));
		console.log(user);
	} else {
		console.log('Bye!');
		$('#results, #changevotes').addClass('hide');
		$('#ballot, #viewresults').removeClass('hide');
	}
});

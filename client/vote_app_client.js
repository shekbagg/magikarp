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
		console.log('Hello!');
	} else {
		console.log('Bye!');

		$('#results, #changevotes').addClass('hide');
		$('#ballot, #viewresults').removeClass('hide');

	}

});



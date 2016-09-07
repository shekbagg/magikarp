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


		// if (Meteor.user()) {
		// 	if(/@tradegecko.com\s*$/.test(Meteor.user().services.google.email)) {
		// 			console.log('Welcome gecko!');
		// 	} else {
		// 		console.log('GTFO');
		// 		Meteor.logout();
		// 	}
		// }
	} else {
		console.log('Bye!');

		$('#results, #changevotes').addClass('hide');
		$('#ballot, #viewresults').removeClass('hide');

	}

});

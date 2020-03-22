//authorisation - check if user is an admin
exports.isAdmin = function (req, res, next) {
	if (req.user.admin) // if user is authenticated in the session, carry on
		return next();

	res.redirect('/'); // if they aren't redirect them to the home page
}

// authentication - check if user is logged in (has an account)
exports.isLoggedIn = function (req, res, next) {
	if (req.isAuthenticated()) // if user is authenticated in the session, carry on
		return next();

        res.redirect('/login'); // if they aren't redirect them to the home page
}

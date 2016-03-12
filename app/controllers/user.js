var User = require('../models/user')

exports.showSignup = function(req, res) {
	res.render('signup', {
		title: '注册页面',
	})
}

exports.showLogin = function(req, res) {
	res.render('login', {
		title: '登录页面',
	})
}

exports.signup = function(req, res) {
	var _user = req.body.user

	User.findOne({name: _user.name}, function(err, user) {
		if (err) {
			console.log(err)
		}

		if (user) {
			return res.redirect('/login')
		} else {
			var user = new User(_user)

			user.save(function(err, user) {
				if (err) {
					console.log(err)
				}

				res.redirect('/')
			})
		}
	})
} 

// Login 
exports.login = function(req, res) {
	var _user = req.body.user
	var name = _user.name
	var password = _user.password

	User.findOne({name: name}, function(err, user) {
		if (err) {
			console.log(err)
		}

		if (!user) {
			return res.redirect('/signup')
		} 

		user.comparePassword(password, function(err, isMatch) {
			if (err) {
				console.log(err)
			}

			if (isMatch) {
				req.session.user = user
				return res.redirect('/')
			} else {
				return res.redirect('/login')
			}
		})
	})
}

// logout
exports.logout = function(req, res) {
	delete req.session.user 
	res.redirect('/')
}

// user list page
exports.list = function(req, res) {
	User.fetch(function(err, users){
		if (err) {
			console.log(err)
		}

		res.render('userlist', {
			title: 'Snote 用户列表页',
			users: users
		})
	})
}

// midware for user
exports.loginRequired = function(req, res, next) {
	var user = req.session.user 

	if (!user) {
		return res.redirect('/login')
	}

	next()
}

exports.adminRequired = function(req, res, next) {
	var user = req.session.user 

	if (user.role <= 10) {
		return res.redirect('/login')
	}

	next()
}
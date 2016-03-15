var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var api_routes = require('../api/routes')
// var Category = require('../app/controllers/category')
// var multer = require('multer')
// var path = require('path')


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//   	var newPath = path.join(__dirname, '../', 'public/upload/tmp')
//     cb(null, newPath)
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })

// var upload = multer({ storage: storage })

module.exports = function(app) {

	// pre handle user
	app.use(function(req, res, next) {
		var _user = req.session.user

		app.locals.user = _user

		next()
	})

	// API Routers
	app.use('/api/v1',api_routes);

	// index 
	app.get('/', Index.index)

	// User
	app.post('/user/signup', User.signup)
	app.post('/user/login', User.login)
	app.get('/login', User.showLogin)
	app.get('/signup', User.showSignup)
	app.get('/logout', User.logout)
	app.get('/admin/user/list', User.loginRequired, User.adminRequired, User.list)

	// // Movie
	// app.get('/movie/:id', Movie.detail)
	// app.get('/admin/movie/new', User.loginRequired, User.adminRequired, Movie.new)
	// app.get('/admin/movie/update/:id', User.loginRequired, User.adminRequired, Movie.update)
	// app.post('/admin/movie', User.loginRequired, User.adminRequired, upload.single('uploadPoster'), Movie.savePoster, Movie.save)
	// app.get('/admin/movie/list', User.loginRequired, User.adminRequired, Movie.list)
	// app.delete('/admin/movie/list', User.loginRequired, User.adminRequired, Movie.del)

	// // Commment
	// app.post('/user/comment', User.loginRequired, Commment.save)

	// Category
	// app.get('/admin/category/new', User.loginRequired, User.adminRequired, Category.new)
	// app.post('/admin/category', User.loginRequired, User.adminRequired, Category.save)
	// app.get('/admin/category/list', User.loginRequired, User.adminRequired, Category.list)

	// // results
	// app.get('/results',  Index.search)

}
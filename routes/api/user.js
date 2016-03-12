var express = require('express')
var router = express.Router()
// var bodyParser = require('body-parser');

// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: true })


var mongoose = require('mongoose')
var User = require('../../models/user.js')

/**
 *  Signup 注册
 */

router.post('/signup', function(req, res) {
  var _user = req.body.user
  var user = new User(_user)

  user.save(function(err, user) {
  	if (err) {
  		console.log(err)
  	}
	console.log(user)
  })

})


module.exports = router
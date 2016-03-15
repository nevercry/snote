var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10
var jwt = require('jsonwebtoken')
/*
	JWT 的密码
 */
var JWT_SECRET = 'SNOTE_SECRET' // JWT Secret 

var UserSchema = new Schema({
	name: {
		unique: true,
		type: String
	},
	password: {
		type: String
	},
	/*
		User  普通用户
		Admin 管理员
	 */
	role: {
		type: String,
		default: 'User'
	},
	email: String,
	mobile: String,
	verify_code: Number,
	token: {
		unique: true,
		type: String
	},
	notes: [{ type: ObjectId, ref: 'Note'}],
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

UserSchema.pre('save', function(next) {
	var user = this

	if (this.isNew) {
		this.meta.createAt = this.meta.update = Date.now();
		// 生成token
		// 如果用户选择手机号注册，用户名为手机号 + '_user';
		
		if (!this.name) {
			this.name = this.mobile + '_user';
		}

		this.token = jwt.sign({"name":this.name,"rolo":this.role},JWT_SECRET);
	} else {
		this.meta.updateAt = Date.now();
	}


	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) {
			next(err)
		}

		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) {
				next(err)
			}

			user.password = hash
			next()
		});
	});

});

UserSchema.methods = {
	comparePassword: function(_password, cb) {
		bcrypt.compare(_password, this.password, function(err, isMatch) {
			if (err) {
				return cb(err)
			}

			cb(null, isMatch)
		})
	},
	compareVerifyCode:function(_verifyCode) {
		return _verifyCode === this.verify_code
	}
}


UserSchema.statics = {
	fetch: function(cb) {
		return this
			.find({})
			.select('-__v')
			.exec(cb)
	},
	findById: function(id, cb) {
		return this
			.findOne({_id: id})
			.select('-__v')
			.exec(cb)
	},
	updateById: function(id, update, cb) {
		return this
			.findByIdAndUpdate(id, update)
			.exec(cb)
	},
	removeById: function(id, cb) {
		return this
			.findByIdAndRemove(id)
			.exec(cb)
	}
}


module.exports = mongoose.model('User', UserSchema)
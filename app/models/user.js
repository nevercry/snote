var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

var UserSchema = new Schema({
	name: {
		unique: true,
		type: String
	},
	password: {
		unique: true,
		type: String
	},
	// 0: normal user
	// 1: verified user
	// 2: professional user
	// 3: 待定

	// >10: admin
	// >50: super admin
	role: {
		type: Number,
		default: 0
	},
	email: {
		unique: true,
		type: String
	},
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
			if (err) return cb(err)

			cb(null, isMatch)
		})
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
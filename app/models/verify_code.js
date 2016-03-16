var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var Verify_codeSchema = new Schema({
	code: String,
	mobile: {
		type: String,
		unique: true
	},
	meta: {
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})


Verify_codeSchema.statics = {
	findByMobile: function(mobile, cb) {
		return this
			.findOne({mobile: mobile})
			.exec(cb)
	},
	removeByMobile: function(mobile, cb) {
		return this
			.findOneAndRemove(mobile)
			.exec(cb)
	}
}

module.exports = mongoose.model('Verify_code', Verify_codeSchema)
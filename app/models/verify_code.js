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
	findByCode: function(code, cb) {
		return this
			.findOne({code: code})
			.exec(cb)
	},
	removeByCode: function(code, cb) {
		return this
			.findOneAndRemove(code)
			.exec(cb)
	}
}

module.exports = mongoose.model('Verify_code', Verify_codeSchema)
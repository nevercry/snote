var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var CategorySchema = new Schema({
	name: String,
	notes: [{type: ObjectId, ref: 'Note'}],
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	},
})

CategorySchema.pre('save', function(next) {
	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	} else {
		this.meta.updateAt = Date.now()
	}

	next()
})

CategorySchema.statics = {
	fetch: function(cb) {
		return this
			.find({})
			.sort('meta.updateAt')
			.select('name notes')
			.exec(cb)
	},
	findById: function(id, cb) {
		return this
			.findOne({_id: id})
			.select('name notes')
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

module.exports = mongoose.model('Category', CategorySchema)
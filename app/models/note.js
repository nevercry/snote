var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var NoteSchema = new Schema({
	title: String,
	url: String,
	content: String,
	note: String,
	category:{ 
		type: ObjectId, 
		ref: 'Category',
		set: function(categoryId) {
			this._previousCategoryId = this.category
			return categoryId
		}
	},
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
	user: {
		type: ObjectId,
		ref: 'User'
	}
})


NoteSchema.statics = {
	fetchByUserId: function(userId,cb) {
		return this
			.find({user: userId})
			.populate('user', 'name')
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


module.exports = mongoose.model('Note', NoteSchema)



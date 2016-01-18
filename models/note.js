var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var NoteSchema = new Schema({
	title: String,
	url: String,
	content: String,
	note: String,
	categorys:[{ type: ObjectId, ref: 'Category' }],
	updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Note', NoteSchema)



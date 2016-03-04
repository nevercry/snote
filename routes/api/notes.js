var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
var Note = require('../../models/note.js')

/* GET /notes listing. */
router.get('/', function(req, res, next) {
  Note.fetch(function(err, notes) {
  	if (err) return next(err)
  	res.json(notes)
  })
})

/* POST /notes  */
router.post('/', function(req, res, next) {
  Note.create(req.body, function (err, note) {
  	if (err) return next(err)
  	res.json(note)
  })
})

/* GET /notes/:id */
router.get('/:id', function(req, res, next) {
  Note.findById(req.params.id, function (err, note) {
  	if (err) return next(err)
  	res.json(note)
  })
})

/* PUT /notes/:id */
router.put('/:id', function(req, res, next) {
  Note.updateById(req.params.id, req.body, function (err, note) {
  	if (err) return next(err)
  	res.json({message: '更新成功', noteId: note._id})
  })
})

/* DELETE /notes/:id */
router.delete('/:id', function(req, res, next) {
  Note.removeById(req.params.id, function (err, note) {
  	if (err) return next(err)
  	res.json({message: '删除成功', noteId: note._id})
  })
})


module.exports = router

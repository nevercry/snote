var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
var Category = require('../../app/models/category.js');

/* GET /categories listing. */
router.get('/', function(req, res, next) {
  Category.fetch(function(err, categories) {
  	if (err) return next(err)
  	res.json(categories)
  })
})

/* POST /categories  */
router.post('/', function(req, res, next) {
  Category.create(req.body, function (err, category) {
  	if (err) return next(err)
  	res.json({catId: category._id, name: category.name})
  })
})

/* GET /categories/:id */
router.get('/:id', function(req, res, next) {
  Category.findById(req.params.id, function (err, category) {
  	if (err) return next(err)
  	res.json(category)
  })
})

/* PUT /categories/:id */
router.put('/:id', function(req, res, next) {
  Category.updateById(req.params.id, req.body, function (err, category) {
  	if (err) return next(err)
  	res.json({message: '更新成功', catId: category._id})
  })
})

/* DELETE /categorys/:id */
router.delete('/:id', function(req, res, next) {
  Category.removeById(req.params.id, function (err, category) {
  	if (err) return next(err)
  	res.json({message: '删除成功', catId: category._id})
  })
})


module.exports = router
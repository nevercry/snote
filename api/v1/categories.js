var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
var Category = require('../../app/models/category.js');

/* GET /categories listing. */
router.get('/', function(req, res, next) {
  var userId = req.decoded["userId"]

  Category.fetchByUserId(userId, function(err, categories) {
  	if (err) {
      err.status = 400
      err.message = '查找数据库出错'
      return next(err)
    }
  	res.json(categories)
  })
})

/* POST /categories  */
// 创建分类
router.post('/', function(req, res, next) {
  /*
    "name":"Dev"
   */
  var tmpCategory = req.body
  // 检查参数是否正确
  var category_name = tmpCategory["name"]
  var userId = req.decoded["userId"]

  var error = new Error()
  error.status = 400
  if (!category_name) {
    error.message = '缺少name参数'
    return next(error)
  }

  var category = new Category({
    name: category_name,
    user: userId
  })

  category.save(function(err, category) {
    if (err) {
      error.message = '数据库保存category出错'
      return next(error)
    }

    res.json({catId: category._id, name: category_name})
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
  	if (err) {
      err.status = 400
      err.message = '数据库删除出错'
      return next(err)
    }
  	res.json({message: '删除成功', catId: category._id})
  })
})


module.exports = router
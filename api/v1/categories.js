var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
var Category = require('../../app/models/category.js')
var Note = require('../../app/models/note.js')

// 获得某用户的分类列表
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

// 获得某条分类的详细
/* GET /categories/:id */
router.get('/:id', function(req, res, next) {
  Category.findById(req.params.id, function (err, category) {
  	if (err) {
      err.status = 400
      err.message = '查找数据库出错'
      return next(err)
    }
  	res.json(category)
  })
})

// 更新某条分类
/* PUT /categories/:id */
router.put('/:id', function(req, res, next) {
  /*
    "name":"Dev"
   */
  var tmpCat = req.body
  var categoryId = req.params.id 
  var cat_name = tmpCat["name"]

  var error = new Error()
  error.status = 400
  if (!cat_name) {
    error.message = '缺少name参数'
    return next(error)
  }

  var newCat = {}
  newCat["name"] = cat_name

  Category.updateById(categoryId, newCat, function (err, category) {
  	if (err) {
      err.status = 400
      err.message = '数据库更新出错'
      return next(err)
    }
  	res.json({message: '更新成功', catId: category._id})
  })
})

// 删除分类
/* DELETE /categorys/:id */
router.delete('/:id', function(req, res, next) {
  /*
    删除分类时，顺带删除分类下的所有笔记，注意提醒用户数据丢失的后果
   */
  Category.removeById(req.params.id, function (err, category) {
  	if (err) {
      err.status = 400
      err.message = '数据库删除出错'
      return next(err)
    }

    Note.remove({category:category._id}, function(err) {
      if (err) {
        err.status = 400
        err.message = '数据库删除出错'
        return next(err)
      }
      res.json({message: '删除成功', catId: category._id})
    })
  })
})


module.exports = router
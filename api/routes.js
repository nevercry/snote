var express = require('express');
var router = express.Router();

var user = require('./v1/user');
var notes = require('./v1/notes');
var categories = require('./v1/categories');

// 用户相关
router.use('/user', user);

// 笔记相关
router.use('/notes', notes);

// 分类相关
router.use('/categories', categories);


module.exports = router;
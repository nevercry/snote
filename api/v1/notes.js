var express = require('express')
var router = express.Router()

var mongoose = require('mongoose')
var Note = require('../../app/models/note.js');
var Category = require('../../app/models/category.js');

// 获取笔记列表
/* GET /notes listing. */
router.get('/', function(req, res, next) {
  var userId = req.decoded["userId"]
  Note.fetchByUserId(userId, function(err, notes) {
  	if (err) {
      err.status = 400;
      err.message = '查找数据库出错';
      return next(err)
    }
  	res.json(notes)
  })
})

// 创建Notes
/* POST /notes  */
router.post('/', function(req, res, next) {
  /*
  "title" : "asdfdsfsceeeedfffffffff",
  "url": "http://douban.com1",
  "content": "非常好的网站1",
  "note": "我很喜欢1",
  "category": "sfsdfsfsdfdf"
   */
  
  var tmpNote = req.body
  var userId = req.decoded["userId"]
  var note_title = tmpNote["title"]
  var note_url = tmpNote["url"]
  var note_content = tmpNote["content"]
  var note_note = tmpNote["note"]
  var note_category = tmpNote['category']

  var error = new Error()
  error.status = 400
  // 检查参数是否正确
  // ---------------
  if (!note_title) {
    error.message = '缺少title参数'
    return next(error)
  }

  if (!note_url) {
    error.message = '缺少url参数'
    return next(error)
  }

  if (!note_category) {
    error.message = '缺少category参数'
    return next(error)
  }

  if (!note_note) {
    error.message = '缺少note参数'
    return next(error)
  }

  if (!note_content) {
    error.message = '缺少content参数'
    return next(error)
  }
  //-----------------
  
  //参数检查都正确，创建note
  var note = new Note({
    title: note_title,
    url: note_url,
    content: note_content,
    note: note_note,
    user: userId,
    category: note_category
  })
 
  note.save(function(err, note) {
    if (err) {
      error.message = '数据库创建note出错'
      return next(error)
    }

    Category.findById(note.category, function(err, category) {
      if (err) {
        error.message = '查找数据库出错'
        return next(error)
      }
      category.notes.push(note._id)
      category.save(function(err, category) {
        if (err) {
          error.message = '数据库保存出错'
          return next(error)
        }
        res.json(note)
      })
    })
  })
})

// 获取某条笔记的详情
/* GET /notes/:id */
router.get('/:id', function(req, res, next) {
  Note.findById(req.params.id, function (err, note) {
  	if (err) {
      err.status = 400
      err.message = '查找数据库出错'
      return next(err)
    }
  	res.json(note)
  })
})

// 更新某条笔记
/* PUT /notes/:id */  
router.put('/:id', function(req, res, next) {
  /*
  "title" : "asdfdsfsceeeedfffffffff",
  "url": "http://douban.com1",
  "content": "非常好的网站1",
  "note": "我很喜欢1",
  "category": "sfsdfsfsdfdf"
   */
  //检查参数是否正确
  var tmpNote = req.body
  var noteId = req.params.id
  var note_title = tmpNote["title"]
  var note_url = tmpNote["url"]
  var note_content = tmpNote["content"]
  var note_note = tmpNote["note"]
  var note_category = tmpNote["category"]

  var newNote = {}
  if (note_title) {
    newNote["title"] = note_title
  }

  if (note_url) {
    newNote["url"] = note_url
  }

  if (note_content) {
    newNote["url"] = note_content
  }

  if (note_note) {
    newNote["note"] = note_note
  }

  if (note_category) {
    newNote["category"] = note_category
  } 

  Note.findById(noteId, function(err, note) {
    if (err) {
      err.status = 400
      err.message = '数据库查找出错'
      return next(err) 
    }

    if (note_category) {
      if (note.category !== note_category) {
        // 更改分类
        Category.findById(note.category, function(err, category){
          if (err) {
            err.status = 400
            err.message = '数据库查找出错'
            return next(err) 
          }

          // 把旧的分类里保存的note删除
          category.notes.pull(noteId)
          category.save(function(err) {
            if (err) {
              err.status = 400
              err.message = '数据库保存出错'
              return next(err) 
            }
            Note.updateById(noteId, newNote, function(err, note) {
              if (err) {
                err.status = 400
                err.message = '数据库查找出错'
                return next(err) 
              }

              // 在新的分类中添加note
              Category.findById(note_category, function(err, category) {
                if (err) {
                  err.status = 400
                  err.message = '查找数据库出错'
                  return next(err)
                }
                category.notes.push(note._id)
                category.save(function(err, category) {
                  if (err) {
                    err.status = 400
                    err.message = '数据库保存出错'
                    return next(err)
                  }
                  res.json({message: '更新成功', noteId: note._id})
                })
              })
            })
          })
        })
      }
    } else {
      Note.updateById(noteId, newNote, function(err, note) {
        if (err) {
          err.status = 400
          err.message = '数据库查找出错'
          return next(err) 
        }
        res.json({message: '更新成功', noteId: note._id})
      })
    }
  })
})


/* DELETE /notes/:id */
router.delete('/:id', function(req, res, next) {
  Note.removeById(req.params.id, function (err, note) {
  	if (err) {
      err.status = 400
      err.message = '数据库删除出错'
      return next(err)
    }
  	res.json({message: '删除成功', noteId: note._id})
  })
})


module.exports = router

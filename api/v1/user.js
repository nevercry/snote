var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../../app/config');

/*
	taobao 发送短信的API
 */
TopClient = require('topSdk').TopClient;
var client = new TopClient({'appkey':config.topClient.appkey,
                            'appsecret':config.topClient.appsecret,
                            'REST_URL':'http://gw.api.taobao.com/router/rest'});

// 短信发送的时间间隔  秒
var VERIFY_MAX_TIME = 10;

var User = require('../../app/models/user');
var Verify_code = require('../../app/models/verify_code');

/**
 *  用户Token 验证
 */
router.auth = function(req, res, next) {
	// check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {      
      if (err) {
        return res.status(401).send({'message': 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded; 
        next();
      }
    });
  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        'message': 'No token provided.' 
    });
    
  }
}

/**
 * 发送短信验证码
 */
router.post('/verifycode', function(req, res) {

	var secret = req.body.secret;  // 短信发送的密钥
	var user_mobile = req.body.mobile;  // 接收短信的号码
	var verify_type = req.body.verify_type; // 验证类型  “注册” or “登录” login or signup

	if (!secret || secret !== config.api_secret) {
		return res.status(400).send({'message': '无法验证身份'});
	} 

	if (!verify_type) {
		return res.status(400).send({'message': '缺少参数 verify_type'});
	}

	// 验证手机号码是否符合规则
	if (/^1[3|4|5|7|8]\d{9}$/.test(user_mobile) === false) {
		return res.status(400).send({'message':'手机号码不正确'})
	}

	var min = 1000;
	var max = 9999;
	var numforCode = Math.floor(Math.random() * (max - min + 1)) + min;

	// 是否可以调用短信发送API
	Verify_code.findOneAndUpdate({mobile: user_mobile}, {code: numforCode}, {upsert: true, new: true}, function(err,verify_code) {
		if (err) {
			return res.status(400).send({'message':'数据库查找出错'})
		}

		// 判断时间是否在规定的时间内
		if ((Date.now() - verify_code.meta.updateAt)/1000 < VERIFY_MAX_TIME) {
			return res.status(400).send({'message':'请稍后再试'})
		} else {
			// 更新最新的时间
			verify_code.meta.updateAt = Date.now()
			verify_code.save(function(err) {
				if (err) {
					console.log(err)
					return res.status(400).send({'message':'数据库保存出错'})
				}

				var codeInfo = {'sign_name':'', 'template_code':''};

				switch (verify_type) {
					case "login":
						codeInfo.sign_name = '登录验证';
						codeInfo.template_code = 'SMS_3090226';
					break;
					case "signup": 
						codeInfo.sign_name = '注册验证';
						codeInfo.template_code = 'SMS_3090224';
					break;
					// TODO: 更多扩展
					default:
						return res.status(400).send({'message': 'verify_type is unkonw'});
					break;
				}

					// 调用短信接口
				client.execute(
					'alibaba.aliqin.fc.sms.num.send',
					{	
						'sms_type':'normal',
						'sms_free_sign_name':codeInfo.sign_name,
						'sms_param':{
							'code':numforCode.toString(),
							'product':'snote'
						},
						'rec_num':user_mobile,
						'sms_template_code':codeInfo.template_code
					},
					function (error,response) {
						if(error) {
							console.log(error);
							return res.status(400).send({'message': '短信发送失败'})
						}

						console.log(response);
						return res.send({'message': '短信发送成功'})
					}
				);
			});
		}
	});
});

/**
 *  Signup 注册
 */
router.post('/signup', function(req, res) {
	var user_mobile = req.body.mobile;
	var user_name = req.body.name;
	var password = req.body.password;
	var verify_code = req.body.verify_code;

	// 检查参数提交是否正确
	if (user_name) {
		if (!password) {
			return res.status(400).send({'message': 'password is null'});
		}
	}

	if (user_mobile) {
		if (!verify_code) {
			return res.status(400).send({'message': 'verify_code is null'});
		}
	}

	if (!user_name && !user_mobile) {
		return res.status(400).send({'message': 'mobile or name is null'});
	}

	// 通过有无用户名来判断注册方式
	if (user_name && password) {
		// 用户名与密码注册
		User.findOne({name: user_name}, function(err, user) {
			if (err) {
				console.log(err);
				return res.status(400).send({'message': '数据库查找出错'});
			}

			if (user) {
				return res.status(400).send({'message': '用户已经注册'});
			} else {
				var user = new User({
					name: user_name,
					password: password
				});

				user.save(function(err, user) {
					if (err) {
						console.log(err);
						return res.status(400).send({'message': '数据库保存失败'});
					}

					return res.json({
						'token':user.token
					});
				});
			}
		});
	} else if (user_mobile && verify_code) {
		// 验证码注册 校验成功后放可注册
		
		// 校验验证码是否正确
		Verify_code.findByMobile(user_mobile, function(err, vf_code) {
			if (err) {
				return res.status(400).send({'message': '数据库查找出错'});
			}

			//console.log("code is " + vf_code + " verify_code is" + verify_code);

			if (vf_code && vf_code.code === verify_code) {
				// 可以注册
				User.findOne({mobile: user_mobile}, function(err, user) {
					if (err) {
						console.log(err);
						return res.status(400).send({'message': '数据库查找出错'});
					}

					if (user) {
						return res.status(400).send({'message': '用户已经注册'});
					} else {
						// 删除验证码
						Verify_code.removeByMobile(user_mobile, function(err) {
							if (err) {
								return res.status(400).send({'message': '数据库删除出错'});
							}

							var user = new User({
								mobile: user_mobile
							});

							user.save(function(err, user) {
								if (err) {
									console.log(err);
									return res.status(400).send({'message': '数据库保存失败'});
								}

								return res.json({
									'token': user.token
								});
							});
						});
					}
				});
			} else {
				return res.status(400).send({'message': '验证码错误'});
			}
		});
	} 
});

/**
 *  Login 登录
 */
router.post('/login', function(req, res) {
	// 用户名密码登录 or  手机号和验证码登录
	var user_name = req.body.name;
	var password = req.body.password;
	var user_mobile = req.body.mobile;
	var verify_code = req.body.verify_code;

	// 检查参数提交是否正确
	// 检查参数提交是否正确
	if (user_name) {
		if (!password) {
			return res.status(400).send({'message': 'password is null'});
		}
	}

	if (user_mobile) {
		if (!verify_code) {
			return res.status(400).send({'message': 'verify_code is null'});
		}
	}

	if (!user_name && !user_mobile) {
		return res.status(400).send({'message': 'mobile or name is null'});
	}

	// 通过有无用户名来判断登录方式
	if (user_name && password) {
		// 用户名与密码登录
		User.findOne({name: user_name}, function(err, user) {
			if (err) {
				console.log(err);
				return res.status(400).send({'message': '数据库查找出错'});
			}

			if (!user) {
				return res.status(400).send({'message': '登录失败，检查用户名是否正确'});
			} else {
				// 验证密码是否正确
				user.comparePassword(password,function(err,isMatch) {
					if (err) {
						return res.status(400).send({'message': '数据库查找出错'});
					}

					if (isMatch) {
						return res.json({'token': user.token});
					} else {
						return res.status(400).send({'message': '登录失败，检查密码是否正确'});
					}
				});
			}
		});
	} else if (user_mobile && verify_code) {
		// 验证码登录 
		
		// 校验验证码是否正确
		Verify_code.findByMobile(user_mobile, function(err, vf_code) {
			if (err) {
				return res.status(400).send({'message': '数据库查找出错'});
			}

			//console.log("code is " + vf_code + " verify_code is" + verify_code);

			if (vf_code && vf_code.code === verify_code) {
				// 可以注册
				User.findOne({mobile: user_mobile}, function(err, user) {
					if (err) {
						console.log(err);
						return res.status(400).send({'message': '数据库查找出错'});
					}

					if (!user) {
						return res.status(400).send({'message': '登录失败，检查手机号是否正确'});
					} else {
						// 删除验证码
						Verify_code.removeByMobile(user_mobile, function(err) {
							if (err) {
								return res.status(400).send({'message': '数据库删除出错'});
							}

							res.json({'token': user.token});
						});
					}
				});
			} else {
				return res.status(400).send({'message': '验证码错误'});
			}
		});
	} 
});


module.exports = router;
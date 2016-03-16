var express = require('express');
var router = express.Router();

/*
	taobao 发送短信的API
 */
TopClient = require('topSdk').TopClient;
var client = new TopClient({'appkey':'23327034',
                            'appsecret':'a5ba6baeb23331bcf55e8112ee435777',
                            'REST_URL':'http://gw.api.taobao.com/router/rest'});

// 短信发送的时间间隔  秒
var VERIFY_MAX_TIME = 60;

var User = require('../../app/models/user');
var Verify_code = require('../../app/models/verify_code');

/**
 * 发送短信验证码
 */
router.post('/verifycode', function(req, res) {

	var secret = req.body.secret;  // 短信发送的密钥
	var user_mobile = req.body.mobile;  // 接收短信的号码

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

					// 调用短信接口
				client.execute(
					'alibaba.aliqin.fc.sms.num.send',
					{	
						'sms_type':'normal',
						'sms_free_sign_name':'注册验证',
						'sms_param':{
							'code':numforCode.toString(),
							'product':'snote'
						},
						'rec_num':user_mobile,
						'sms_template_code':'SMS_3090224'
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

module.exports = router;
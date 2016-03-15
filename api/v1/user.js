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
var VERIFY_MAX_TIME = 10;

var User = require('../../app/models/user');
var Verify_code = require('../../app/models/verify_code');

/*
	发送短信验证码
 */

router.post('/verifycode', function(req, res) {

	var secret = req.body.secret;  // 短信发送的密钥
	var _mobile = req.body.mobile;  // 接收短信的号码

	// 验证手机号码是否符合规则
	if (!/^1[3|4|5|7|8]\d{9}$/.test(_mobile)) {
		res
			.status(400)
			.send({'message':'手机号码不正确'})
	}

	var min = 1000;
	var max = 9999;
	var numforCode = Math.floor(Math.random() * (max - min + 1)) + min;

	// 是否可以调用短信发送API
	Verify_code.findOneAndUpdate({mobile: _mobile}, {code: numforCode}, {upsert: true, new: true}, function(err,verify_code) {
		if (err) {
			res
				.status(400)
				.send({'message':'数据库查找出错'})
		}

		// 判断时间是否在规定的时间内
		if ((Date.now() - verify_code.meta.updateAt)/1000 < VERIFY_MAX_TIME) {
			res
				.status(400)
				.send({'message':'请稍后再试'})
		} else {
			// 更新最新的时间
			verify_code.meta.updateAt = Date.now()

			verify_code.save(function(err) {
				if (err) {
					console.log(err)
					res
						.status(400)
						.send({'message':'数据库保存出错'})
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
						'rec_num':_mobile,
						'sms_template_code':'SMS_3090224'
					},
					function (error,response) {
						if(error) {
							console.log(error);

							res
								.status(400)
								.send({'message': '短信发送失败'})
						}

						console.log(response);
						res.send({'message': '短信发送成功'})

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

});


module.exports = router;
/**
 * Created by focus on 2017/4/14.
 */

module.exports = {
    email: {
        test: /.+@.+\..+/,
        message: '邮箱格式错误'
    },
	mobile:{
		test:/^1[34578]\d{9}$/,
		message:"手机号码格式不正确"
	},
    required: {
        test: /\S+/,
        message: '必填'
    },
    url: {
        test: /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[:?\d]*)\S*$/,
        message: 'URL 格式错误'
    }
}
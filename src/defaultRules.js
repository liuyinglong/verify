/**
 * Created by focus on 2017/4/14.
 */

export default {
    email: {
        test: /.+@.+\..+/,
        message: '邮箱格式错误'
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
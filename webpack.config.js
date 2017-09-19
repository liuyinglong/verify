/**
 * Created by focus on 2017/4/17.
 */


var path = require("path");
var webpack = require("webpack");

module.exports={
    entry:"./src/index.js",
    output:{
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
        filename: 'verify.js'
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },
    devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            //minimize: true
        })
    ])
}
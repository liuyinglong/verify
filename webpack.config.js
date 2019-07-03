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
    devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'

    module.exports.plugins = (module.exports.plugins || []).concat([
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
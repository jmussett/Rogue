var browserSync = require('browser-sync').create();
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var stripAnsi = require('strip-ansi');
var webpackConfig = require('./webpack.config');
var bundler = webpack(webpackConfig);

bundler.plugin('done', function (stats) {
    if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
            title: "Webpack Error:",
            body:  stripAnsi(stats.toString()),
            timeout: 100000
        });
    }
    browserSync.reload();
});

browserSync.init({
    server: 'public',
    port: 8080,
    open: false,
    logConnections: true,
    middleware: [
        webpackDevMiddleware(bundler, {
            publicPath: webpackConfig.output.publicPath,
            stats: {colors: true}
        })
    ],
    plugins: ['bs-fullscreen-message'],
    files: [
        'public/css/*.css',
        'public/*.html'
    ]
});
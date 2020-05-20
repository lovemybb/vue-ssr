const path = require('path')
const webpack = require('webpack')
const MFS = require('memory-fs')
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

module.exports = function setupDevServer(app, cb) {
    let bundle
    let template
    let manifest

    // 修改客户端配置添加 热更新中间件
    clientConfig.entry = ['webpack-hot-middleware/client', clientConfig.entry]
    clientConfig.output.filename = '[name].js'
    clientConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )

    // DEV Middleware
    const clientCompiler = webpack(clientConfig) // 执行webpack
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
        publicPath: clientConfig.output.publicPath,
        stats: {
            colors: true,
            chunks: false
        }
    })
    app.use(devMiddleware)

    clientCompiler.plugin('done', () => {
        const fs = devMiddleware.fileSystem
        console.log('clientConfig.output.path', clientConfig.output.path)
        try {
            const filePath = path.join(__dirname, '../index.html') // 模板为打包后的html文件
            const manifestPath = path.join(clientConfig.output.path, 'vue-ssr-client-manifest.json') // 模板为打包后的html文件
            console.log('clientConfig.output.path2', filePath, fs.existsSync(filePath))
            if (fs.existsSync(filePath)) {
                console.log('clientConfig.output.pat3', clientConfig.output.path)

                template = fs.readFileSync(filePath, 'utf-8')
                manifest = fs.readFileSync(manifestPath, 'utf-8')

                console.log(4444444444, template)
                if (bundle) {
                    console.log(55555555)
                    cb(bundle, template, manifest)
                } else {
                    console.error("bundle", 'not exists')
                }
            } else {
                console.error("filePath", filePath, 'not exists')
            }
        } catch (error) {
            console.error(error)
        }

    })

    // HOT Middleware
    app.use(require('webpack-hot-middleware')(clientCompiler))

    // 监听 server renderer
    const serverCompiler = webpack(serverConfig)
    const mfs = new MFS() // 内存文件系统，在JavaScript对象中保存数据。
    serverCompiler.outputFileSystem = mfs
    serverCompiler.watch({}, (err, stats) => {
        if (err) throw err
        stats = stats.toJson()
        stats.errors.forEach(err => console.error(err))
        stats.warnings.forEach(err => console.warn(err))

        // 读取使用vue-ssr-webpack-plugin生成的bundle（vue-ssr-server-bundle.json）
        const bundlePath = path.join(serverConfig.output.path, 'vue-ssr-server-bundle.json')
        bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
        console.log(3333333333)
        if (template) {
            console.log(2222222222)
            cb(bundle, template, manifest)
        } else {
            console.error("template", 'not exists')
        }
    })
}
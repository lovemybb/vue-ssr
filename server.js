const fs = require('fs')
const path = require('path')
const express = require('express')
// const favicon = require('serve-favicon') // icon图标
const compression = require('compression') // 开启gzip压缩
const resolve = file => path.resolve(__dirname, file)
// const proxy = require('http-proxy-middleware');//引入代理中间件

const isProd = process.env.NODE_ENV === 'production'

const app = express()

function createRenderer(bundle, template, clientManifest) {
    // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
    return require('vue-server-renderer').createBundleRenderer(bundle, {
        runInNewContext: false, // 推荐
        template,
        // 缓存
        clientManifest

    })
}

let renderer
if (isProd) {
    try {
        // 生产创建服务端渲染使用 server bundle 和 html
        // server bundle的生成依赖于 vue-ssr-webpack-plugin 插件
        const serverBundle = require('./dist/vue-ssr-server-bundle.json')

        // html模板由 html-webpack-plugin 插件注入资源并输出 'dist/index.html'
        const template = fs.readFileSync(resolve('./index.html'), 'utf-8')
        const clientManifest = require('./dist/vue-ssr-client-manifest.json')
        renderer = createRenderer(serverBundle, template, clientManifest)
        startServer()
    } catch (error) {
        console.log(error, 'error prod')
    }
} else {
    console.log('renderer=========================')

    // 开发模式需要设置 dev-server 和 hot-reload
    // 创建一个新renderer更新模板
    require('./build/setup-dev-server')(app, (bundle, template) => {
        console.log('renderer=========================')
        try {
            renderer = createRenderer(bundle, template)
            startServer()
        } catch (error) {
            console.log(error)
        }
        console.log('renderer=========================')
    })

}

function startServer() {
    const serve = (path, cache) => express.static(resolve(path), {
        maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0 // 静态资源设置缓存
    })

    app.use(compression({
        threshold: 0
    })) // gzip压缩
    // app.use(favicon('./public/logo-48.png')) // icon
    app.use('/dist', serve('./dist', true)) // 静态资源
    app.use('/public', serve('./public', true)) // 静态资源 （如：http://localhost:8080/public/logo-120.png）
    app.use('/manifest.json', serve('./manifest.json', true))

    app.get('*', (req, res) => {
        // 未渲染好返回
        if (!renderer) {
            return res.end('waiting for compilation... refresh in a moment.')
        }

        const s = Date.now()

        res.setHeader("Content-Type", "text/html")

        const errorHandler = err => {
            if (err && err.code === 404) {
                console.log(404)
                res.status(404).end('404 | Page Not Found')
            } else {
                // Render Error Page or Redirect
                res.status(500).end('500 | Internal Server Error')
                console.error(`error during render : ${req.url}`)
                console.error(err)
            }
        }

        var title = 'cnodeJs' // 自定义变量（此处用于title）

        renderer.renderToStream({
                title,
                url: req.url
            }) // 可传参数来渲染模板页 url: req.url 必传 其为entry-server.js入参 context
            .on('error', errorHandler)
            .on('end', () => console.log(`whole request: ${Date.now() - s}ms`))
            .pipe(res)
    })

    const port = process.env.PORT || 3002

    app.listen(port, () => {
        console.log(`server started at localhost:${port}`)
    })
}
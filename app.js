/**
 * Date:2020/4/30
 * Desc:
 */
'use strict';

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const logger = require('morgan');
const cors = require('cors');
const compression = require('compression');

// file system
const db = require('./modules/models/db');
const routes = require('./modules/routes/index');
const resource = require('./modules/routes/resource');
const docs = require('./modules/routes/docs');
const mock = require('./modules/routes/mock');
const config = require('./modules/config/index');

const _ = require('lodash');
const utils = require('./modules/utils/index');

const app = express();
//
app.set('port', process['env']['PORT'] || config['port'] || 3000);
//
app.set('views', path.join(__dirname, 'modules/views'));
//
app.set('view engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
//
//
app.use(serveStatic(path.join(__dirname, 'public')));

if (config.debug) {
    app.use(require('errorhandler')());
}

// config  error
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('服务器出小差了，一会回来。。。');
});

//
app.use(logger('combined'));
// enable CORS request
app.use(cors());

//
app.use(compression());

app.locals.moment = require('moment');

//
app.get('/', mock.index);
//
app.get('/documents', docs.index);
//
app.get('/document/:name', docs.item);
// mock 平台
app.get('/mock', mock.index);
//
app.get('/mock/prefix', mock.prefix);
//
app.get('/mock/prefix/search', mock.searchPrefix);
// 新增
app.post('/mock/prefix/create', mock.createPrefix);
// 修改
app.post('/mock/prefix/update', mock.updatePrefix);
//
app.get('/mock/search', mock.search);
//
app.get('/mock/create', mock._new);
//
app.get('/mock/show/:id', mock.show);
//
app.get('/mock/url/valid', mock.valid);
//
app.post('/mock/create', mock.create);
//
app.get('/mock/edit/:id', mock.edit);
//
app.post('/mock/edit', mock.update);
//
app.post('/mock/delete', mock.delete);
//
app.get('/mock/historyList/async/:id', mock.asyncHistoryList);
//
app.get('/mock/history/async/:id', mock.asyncHistory);
//
app.get('/mock/prefixList/async', mock.asyncPrefixList);

// api 的 获取
app.get('/api/*', mock.api);
app.post('/api/*', mock.api);


// 异常处理
app.get('*', function (req, res) {
    let reqUrl = req.originalUrl;
    // 如果是 以 js,css,png,jpg 等静态资源结尾的，则需要重定向请求。
    const sourceArray = ['js', 'css', 'png', 'gif', 'bmp', 'jpg', 'jpeg'];

    let tempIndex = reqUrl.lastIndexOf('.');

    if (tempIndex !== -1) {
        let suffix = reqUrl.substring(tempIndex + 1);

        // 如果是资源请求
        if (_.indexOf(sourceArray, suffix) !== -1) {
            reqUrl = utils.helpReqResourceUrl(reqUrl);
            res.redirect(reqUrl);
        }
        else {
            //
            res.status(404).render('404.ejs', {
                title: '404',
                user: req.session.user,
            });
        }
    }
    else {
        //
        res.status(404).render('404.ejs', {
            title: '404',
            user: req.session.user,
        });
    }
});

app.listen(app.get('port'));

console.log('listen port:' + app.get('port'));
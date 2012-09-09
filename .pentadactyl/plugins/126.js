// 126/网易短网址缩短服务，同时将结果复制到剪贴板。
// http://126.am/
//
// 用法
//
// " 显示当前网页的短网址
// :netease
// http://126.am/jp0Gx1
//
// " 显示 baidu 的短网址
// :netease baidu.com
// http://126.am/JtUf71
//
group.commands.add(['net[ease]'],
    '126/网易短网址服务',
    function(args) {
        let url = args[0] || buffer.URL;
        let send = {
            urls: [
                {
                    url: url.trim()
                }
            ]
        };
        xhr = new window.XMLHttpRequest();
        xhr.open('POST', 'http://126.am/short.action');
        xhr.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function(evt) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.result) {
                    let urls = data.shortUrls;
                    let str = '';
                    urls.forEach(function(item) {
                            str += item.url + '\n';
                            dactyl.echo(item.url);
                    });
                    dactyl.clipboardWrite(str);
                } else {
                    dactyl.echoerr('未返回任何短网址！');
                }
            } else {
                dactyl.echoerr('获取短网址失败！返回状态代码：' + xhr.status);
            }
        };
        xhr.send('json=' + encodeURIComponent(JSON.stringify(send)));
    },
    {
        argCount: '?',
        literal: 0
    },
    true
);

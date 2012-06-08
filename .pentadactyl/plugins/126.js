// 126/网易短网址缩短服务，并将结果同时复制到剪贴板。
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
group.commands.add(['netease', '自己改一个简单的命令吧！'],
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
        xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://126.am/short.action');
        xhr.setRequestHeader('Content-Type',
            'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function(evt) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    let urls = data.shortUrls;
                    let str = '';
                    urls.forEach(function(item) {
                        str += item.url + '\n';
                        dactyl.echo(item.url);
                    });
                    dactyl.clipboardWrite(str);
                }
            }
        };
        xhr.send('json=' + JSON.stringify(send));
    },
    {
        argCount: '?',
        literal: 0
    },
    true
);

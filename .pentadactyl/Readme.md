pentadactyl-1.0rc2pre.xpi 绿色便携版本
hg 版本：6778


http://g.mozest.com/viewthread.php?tid=41606


比如 firefox 安装在 C:/firefox

配置文件路径：（Windows 下）

C:/firefox/_pentadactylrc

C:/firefox/pentadactyl

linux 下类似

FAQ

1. 能将 pentadactyl 的配置信息放到 profile 目录中去吗？


可以的，将 xpi 文件中的 chrome/common/modules/io.jsm 和 chrome/common/content/dactyl.js 中的 CurProcD 换成 ProfD 就可以了。

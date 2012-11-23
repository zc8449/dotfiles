拼音/五笔首字母搜索链接
========================

让 pentadactyl 支持按拼音/五笔首字母搜索链接，对多音字有部分支持，但不完美。

安装
====

将脚本 ``chinese-hints.js`` `<https://github.com/grassofhust/dotfiles/blob/master/.pentadactyl/plugins/chinese-hints.js>`_ 复制到 pentadactyl 的个人配置目录下的 ``plugins`` 目录。

设置
======

* 启用拼音搜索链接::

  set hintmatching=custom

* 启用五笔搜索链接::

  set hintmatching=custom chinesehints=wubi

自定义选项
===========

+------------------+------------+------+--------+
| ``chinesehints`` | ``pinyin`` | 拼音 | 默认值 |
+                  +------------+------+--------+
|                  | ``wubi``   | 五笔 |        |
+------------------+------------+------+--------+

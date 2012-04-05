"=============================================================================
" FILE: xptemplate_complete.vim
" AUTHOR:  Yang Zou <frederick.zou@gmail.com>
" Last Modified: 04 Apr 2012
" License: MIT license  {{{
"     Permission is hereby granted, free of charge, to any person obtaining
"     a copy of this software and associated documentation files (the
"     "Software"), to deal in the Software without restriction, including
"     without limitation the rights to use, copy, modify, merge, publish,
"     distribute, sublicense, and/or sell copies of the Software, and to
"     permit persons to whom the Software is furnished to do so, subject to
"     the following conditions:
"
"     The above copyright notice and this permission notice shall be included
"     in all copies or substantial portions of the Software.
"
"     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
"     OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
"     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
"     IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
"     CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
"     TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
"     SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
" }}}
"=============================================================================

let s:save_cpo = &cpo
set cpo&vim

let s:source = {
      \ 'name' : 'xptemplate_complete',
      \ 'kind' : 'plugin',
      \}

function! s:source.initialize()"{{{
  " Set completion length.
  call neocomplcache#set_completion_length('xptemplate_complete',
        \ 1)

  " Initialize.
endfunction"}}}

function! s:source.finalize()"{{{
endfunction"}}}
" cur_keyword_str 检查特殊字符，比如 <_ 之类的
function! s:source.get_keyword_list(cur_keyword_str)"{{{
  " https://groups.google.com/forum/?fromgroups#!topic/xptemplate/2bWtWGLudlY
  if !exists('b:xpt_snippets_parsed') " HACK
    call XPTparseSnippets()
    let b:xpt_snippets_parsed = 1
  endif
  let allTemplates = XPTgetAllTemplates()
  let list = []

  for [snippet, template] in items(allTemplates)
    let setting = template.setting
    if setting.hidden || setting.wraponly
      continue
    endif
    let hint = snippet
    if has_key(setting, 'hint')
      let hint = setting.hint
    endif
    call add(list,
          \{ 'word' : snippet, 'menu' : '[XPT]', 'dup' : 1, 'abbr': printf('%s " %s', snippet, hint) }) " TODO: info
  endfor

  return neocomplcache#keyword_filter(list, a:cur_keyword_str)
endfunction"}}}

function! neocomplcache#sources#xptemplate_complete#define()"{{{
  return s:source
endfunction"}}}

let &cpo = s:save_cpo
unlet s:save_cpo

" vim: et foldmethod=marker ts=2 sw=2


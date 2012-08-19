#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import re
import StringIO
from mwlib.dummydb import DummyDB
from mwlib.uparser import parseString
from mwlib.xhtmlwriter import MWXHTMLWriter, preprocess

MWXHTMLWriter.ignoreUnknownNodes = False


def getXHTML(wikitext):
    saved_stdout = sys.stdout
    sys.stdout = StringIO.StringIO()
    db = DummyDB()
    r = parseString(title="", raw=wikitext, wikidb=db)
    preprocess(r)
    dbw = MWXHTMLWriter()
    dbw.writeBook(r)
    sys.stdout = saved_stdout
    return dbw.asstring()


def transFileName(filename, suffix):
    return re.sub(r'\.[^\.]*$', suffix, filename)


if __name__ == "__main__":
    filename = sys.argv[1]
    raw = open(filename).read().decode('utf8')
    output = open(transFileName(filename, '.xhtml'), 'w')
    xhtml = getXHTML(raw)
    output.write(xhtml)


# vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4 textwidth=79

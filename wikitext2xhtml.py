#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import os
import re
from mwlib.dummydb import DummyDB
from mwlib.uparser import parseString
from mwlib.xhtmlwriter import MWXHTMLWriter, preprocess

MWXHTMLWriter.ignoreUnknownNodes = False


class SuppressOutput(object):
    '''A context manager for doing a "deep suppression" of stdout and stderr in
    Python

    i.e. will suppress all print, even if the print originates in a compiled
    C/Fortran sub-function.

    This will not suppress raised exceptions, since exceptions are printed to
    stderr just before a script exits, and after the context manager has exited
    (at least, I think that is why it lets exceptions through).

    '''
    def __init__(self):
        # Open a pair of null files.
        self.null_fds = [os.open(os.devnull, os.O_RDWR) for x in range(2)]
        # Save the actual stdout (1) and stderr (2) file descriptors.
        self.saved_fds = (os.dup(1), os.dup(2))

    def __enter__(self):
        # Assign the null pointers to stdout and stderr.
        os.dup2(self.null_fds[0], 1)
        os.dup2(self.null_fds[1], 2)

    def __exit__(self, *_):
        # Close the null files
        os.close(self.null_fds[0])
        os.close(self.null_fds[1])
        # Re-assign the real stdout/stderr back to (1) and (2)
        os.dup2(self.saved_fds[0], 1)
        os.dup2(self.saved_fds[1], 2)


def getXHTML(wikitext):
    db = DummyDB()
    r = parseString(title="", raw=wikitext, wikidb=db)
    preprocess(r)
    dbw = MWXHTMLWriter()
    with SuppressOutput():
        dbw.writeBook(r)
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

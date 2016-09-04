from __future__ import print_function, absolute_import

# set up environment
import sys
import os

try:
    if 'GAE_SDK' in os.environ:
        sys.path.insert(0, os.environ['GAE_SDK'])

    import dev_appserver

    dev_appserver.fix_sys_path()
except ImportError:
    dev_appserver = None
    print('GAE Python SDK is required')
    sys.exit(-1)

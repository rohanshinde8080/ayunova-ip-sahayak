"""
Python 3.10 Compatibility Shims for deepagents and modern typing/datetime APIs.
Ensures typing.Required, typing.NotRequired, and datetime.UTC are available.
"""

import sys
import datetime
import typing
import typing_extensions

if not hasattr(datetime, "UTC"):
    setattr(datetime, "UTC", datetime.timezone.utc)

if not hasattr(typing, "Required"):
    setattr(typing, "Required", typing_extensions.Required)

if not hasattr(typing, "NotRequired"):
    setattr(typing, "NotRequired", typing_extensions.NotRequired)

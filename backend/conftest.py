"""
Pytest configuration and environment setup for AYUNOVA Backend.
"""

import sys
import os

# Ensure backend root is on sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import compatibility shims
import app.core.compat

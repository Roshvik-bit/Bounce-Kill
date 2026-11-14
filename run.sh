#!/bin/bash
# ==============================================================================
# Bounce Kill - Fast Runner Script
# Launches the 3D tactical shooter local development server.
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Starting Bounce Kill Development Server..."
python3 serve.py


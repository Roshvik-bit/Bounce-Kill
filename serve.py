#!/usr/bin/env python3
"""
==============================================================================
Bounce Kill - Local Development & Test Runner (serve.py)
Spins up a lightweight local HTTP server for instant testing and play.
==============================================================================
"""

import sys
import os
import socket
import http.server
import socketserver
import webbrowser

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.mjs': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.wasm': 'application/wasm',
    }

    def end_headers(self):
        # Enable CORS and disable caching during prototype development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()


def find_available_port(start_port):
    port = start_port
    while port < start_port + 100:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
            port += 1
    return start_port


def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    port = find_available_port(PORT)

    print("=" * 72)
    print("  ⚡ BOUNCE KILL - 3D TACTICAL FPS PROTOTYPE ⚡")
    print("=" * 72)
    print(f"  Local Server:  http://localhost:{port}")
    print(f"  Root Dir:      {os.getcwd()}")
    print("  Controls:      [WASD] Move | [Mouse] Look | [L-Click] Fire")
    print("  The Rule:      Direct shots do 0 damage. Bounce bullets off walls!")
    print("=" * 72)
    print("  Press Ctrl+C to terminate.")
    print("-" * 72)

    try:
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            if len(sys.argv) > 1 and sys.argv[1] == "--open":
                webbrowser.open(f"http://localhost:{port}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down.")


if __name__ == '__main__':
    main()


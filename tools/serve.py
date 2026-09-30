"""Local server for Meridian Atlas: http://localhost:8765

Like `python -m http.server`, but tells the browser to check for newer files on every load
(Cache-Control: no-cache). Unchanged files still come from the browser cache (HTTP 304), so it stays
fast, but you never get stale JavaScript after an update.
"""
import http.server
import os
import socketserver

PORT = 8765


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the console quiet
        pass


os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
    print(f"Meridian Atlas running at http://localhost:{PORT}  (Ctrl+C to stop)")
    httpd.serve_forever()

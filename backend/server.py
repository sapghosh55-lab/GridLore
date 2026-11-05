#!/usr/bin/env python3
"""
GridLore Backend Dummy Server
Listens on http://localhost:8000/generate-lore
Zero dependencies - uses Python's standard library.
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time

PORT = 8000

class GridLoreHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(204)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        if self.path == '/generate-lore':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)

            try:
                payload = json.loads(post_data.decode('utf-8'))
            except Exception as e:
                payload = {}

            block_type = payload.get('block_type', 'Structure')
            x = payload.get('x', 0)
            z = payload.get('z', 0)
            adjacent = payload.get('adjacent_blocks', [])

            print(f"\n[GridLore Backend] Received Placement:")
            print(f"  Block: {block_type} at ({x}, {z})")
            print(f"  Adjacent blocks ({len(adjacent)}): {adjacent}")

            # Simulate neural lore synthesis latency (1.0s) so the purple loading state shines
            time.sleep(1.0)

            # Generate dummy lore based on spatial context
            adj_names = [a.get('block_type', a.get('type', 'terrain')) for a in adjacent]
            
            if "Mountain" in adj_names and block_type == "Tavern":
                lore = (
                    f"Perched upon the frosty foothills at ({x}, {z}), this Tavern provides shelter "
                    f"to mountaineers seeking respite from the adjacent Mountain peak. Hearth-smoked "
                    f"venison stew and spiced mulled wine warm the travelers as arctic gales rattle the shutters."
                )
            elif "Forest" in adj_names and block_type == "Tavern":
                lore = (
                    f"Sheltered beneath the ancient whispering pines of the bordering Forest at ({x}, {z}), "
                    f"the Tavern's amber lanterns cast dancing silhouettes across mossy flagstones. "
                    f"Herbalists and rangers share quiet tales of spirits roaming the woodland canopy."
                )
            elif "Forest" in adj_names and block_type == "Mountain":
                lore = (
                    f"Massive granite crags thrust upward at ({x}, {z}), casting deep violet shadows across "
                    f"the neighboring Forest canopy. Mountain springs cascade down the fissures into the fertile loam below."
                )
            elif "Mountain" in adj_names and block_type == "Forest":
                lore = (
                    f"Sturdy alpine firs scale the steep incline toward the neighboring Mountain at ({x}, {z}). "
                    f"Their ancient roots grip fractured shale, defying the howling altitude winds."
                )
            elif adjacent:
                lore = (
                    f"Constructing a {block_type} at coordinates ({x}, {z}) harmonizes the surrounding terrain. "
                    f"The proximity to neighbouring {', '.join(adj_names)} weaves a rich new chapter into the local realm."
                )
            else:
                lore = (
                    f"A solitary {block_type} rises at isolated coordinates ({x}, {z}). "
                    f"The realm awaits further expansion to awaken this territory's latent history."
                )

            response_data = {
                "lore": lore,
                "block_type": block_type,
                "coordinates": {"x": x, "z": z},
                "adjacent_count": len(adjacent),
                "generated_at": time.strftime("%H:%M:%S")
            }

            self.send_response(200)
            self._set_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            print(f"  -> Generated Lore: \"{lore[:60]}...\"\n")
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

    def do_GET(self):
        # Health check
        self.send_response(200)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "GridLore backend operational", "port": PORT}).encode('utf-8'))

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), GridLoreHandler)
    print(f"GridLore Lore Generation Server running on http://localhost:{PORT}")
    print("Endpoint: POST http://localhost:8000/generate-lore")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


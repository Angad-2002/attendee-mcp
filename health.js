#!/usr/bin/env node

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Start the MCP server in the background
const mcpServer = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

mcpServer.stdout.on('data', (data) => {
  console.log('MCP Server:', data.toString());
});

mcpServer.stderr.on('data', (data) => {
  console.error('MCP Server Error:', data.toString());
});

mcpServer.on('close', (code) => {
  console.log(`MCP Server process exited with code ${code}`);
});

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      service: 'attendee-mcp',
      mcpServer: mcpServer.pid ? 'running' : 'stopped',
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Attendee MCP Server</title></head>
        <body>
          <h1>Attendee MCP Server</h1>
          <p>Status: Running</p>
          <p>MCP Server PID: ${mcpServer.pid || 'Not running'}</p>
          <p><a href="/health">Health Check</a></p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
  console.log(`MCP Server started with PID: ${mcpServer.pid}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  mcpServer.kill();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  mcpServer.kill();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 
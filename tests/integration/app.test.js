/**
 * GitHubReadTool Test Suite
 * Comprehensive testing for all application components
 */

import { describe, it, expect, beforeEach, afterEach } from 'node:test';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

describe('GitHubReadTool Application Tests', () => {
  let serverProcess;

  beforeEach(async () => {
    // Start server for testing
    serverProcess = spawn('node', ['resume-server.js'], {
      env: { ...process.env, PORT: TEST_PORT },
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server start timeout')), 10000);
      
      const checkServer = () => {
        const req = http.get(BASE_URL, (res) => {
          clearTimeout(timeout);
          resolve();
        });
        req.on('error', () => {
          setTimeout(checkServer, 100);
        });
      };
      
      setTimeout(checkServer, 1000);
    });
  });

  afterEach(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe('Server Endpoints', () => {
    it('should serve homepage successfully', async () => {
      const response = await fetch(BASE_URL);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should serve resume builder interface', async () => {
      const response = await fetch(`${BASE_URL}/builder`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should serve API documentation', async () => {
      const response = await fetch(`${BASE_URL}/api/docs`);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await fetch(`${BASE_URL}/non-existent-route`);
      expect(response.status).toBe(404);
    });
  });

  describe('File Structure Validation', () => {
    it('should have required project files', async () => {
      const requiredFiles = [
        'package.json',
        'README.md',
        'resume-server.js',
        'interactive-resume-builder.html',
        'SyedSalmanRezaResume_PDF.html',
        'SyedSalmanRezaResume_Professional.html'
      ];

      for (const file of requiredFiles) {
        try {
          await fs.access(file);
        } catch (error) {
          throw new Error(`Required file ${file} is missing`);
        }
      }
    });
  });
});

// Helper function for testing
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export test utilities
export { TEST_PORT, BASE_URL };
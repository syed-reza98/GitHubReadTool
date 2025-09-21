/**
 * GitHubReadTool Test Suite
 * Comprehensive testing for all application components
 */

import { describe, it, before, after } from 'node:test';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import assert from 'assert';

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

describe('GitHubReadTool Application Tests', () => {
  let serverProcess;

  before(async () => {
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

  after(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  describe('Server Endpoints', () => {
    it('should serve homepage successfully', async () => {
      const response = await fetch(BASE_URL);
      assert.strictEqual(response.status, 200);
      assert(response.headers.get('content-type').includes('text/html'));
    });

    it('should serve resume builder interface', async () => {
      const response = await fetch(`${BASE_URL}/builder`);
      assert.strictEqual(response.status, 200);
      assert(response.headers.get('content-type').includes('text/html'));
    });

    it('should provide health check', async () => {
      const response = await fetch(`${BASE_URL}/api/health`);
      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.status, 'healthy');
    });

    it('should handle 404 for non-existent routes', async () => {
      const response = await fetch(`${BASE_URL}/non-existent-route`);
      assert.strictEqual(response.status, 404);
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
          assert.fail(`Required file ${file} is missing`);
        }
      }
    });

    it('should have required directories', async () => {
      const requiredDirs = [
        'docs',
        'docs/projects',
        'scripts',
        'models',
        'src',
        'public'
      ];

      for (const dir of requiredDirs) {
        try {
          const stat = await fs.stat(dir);
          assert(stat.isDirectory(), `${dir} should be a directory`);
        } catch (error) {
          assert.fail(`Required directory ${dir} is missing`);
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
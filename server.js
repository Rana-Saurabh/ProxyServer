const axios = require('axios');
const express = require('express');
const NodeCache = require('node-cache');
const path = require('path');

class CachingProxyServer {
    constructor(port, origin) {
        this.port = port;
        this.origin = origin;
        this.cache = new NodeCache({ stdTTL: 3600 });
        this.app = express();
        this.logs = [];
        
        this.setupRoutes();
    }

setupRoutes() {
    // API routes first
	
    this.app.get('/logs', (req, res) => {
        res.json(this.logs);
    });

    this.app.post('/clear-cache', (req, res) => {
        this.clearCache();
        res.json({ message: 'Cache cleared successfully' });
    });

    // Add this line to handle favicon
    this.app.get('/favicon.ico', (req, res) => res.status(204).send());

    // Dashboard route
    this.app.get('/dashboard', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    // Catch-all route for proxying - must be last
    this.app.get('*', this.handleRequest.bind(this));
}

    async handleRequest(req, res) {
        const url = `${this.origin.replace(/\/+$/, '')}${req.originalUrl}`;
        const cachedResponse = this.cache.get(url);

        if (cachedResponse) {
            console.log(`Cache HIT for: ${url}`);
            this.logs.push({
                url,
                status: 'HIT',
                time: new Date().toISOString()
            });
            
            res.setHeader('X-Cache', 'HIT');
            
            // Set cached headers
            if (cachedResponse.headers) {
                for (const [key, value] of Object.entries(cachedResponse.headers)) {
                    if (key.toLowerCase() !== 'content-encoding') { // Avoid double encoding issues
                        res.setHeader(key, value);
                    }
                }
            }
            
            return res.status(200).send(cachedResponse.data);
        }

        try {
            console.log(`Cache MISS - Forwarding request to: ${url}`);
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 10000, // 10 second timeout
                headers: {
                    'User-Agent': 'CachingProxy/1.0'
                }
            });

            const data = Buffer.from(response.data);
            const headers = { ...response.headers };
            
            // Remove headers that shouldn't be cached
            delete headers['set-cookie'];
            delete headers['authorization'];

            // Cache the response
            this.cache.set(url, { data, headers });
            
            this.logs.push({
                url,
                status: 'MISS',
                time: new Date().toISOString()
            });

            res.setHeader('X-Cache', 'MISS');
            for (const [key, value] of Object.entries(headers)) {
                res.setHeader(key, value);
            }

            res.status(response.status).send(data);
        } catch (error) {
            const statusCode = error.response ? error.response.status : 500;
            const errorMessage = error.response ? error.response.statusText : error.message;
            
            console.error(`Request failed for ${url}: ${statusCode} - ${errorMessage}`);
            
            this.logs.push({
                url,
                status: 'ERROR',
                error: errorMessage,
                time: new Date().toISOString()
            });
            
            res.status(statusCode).json({ 
                error: errorMessage,
                url: url
            });
        }
    }

    clearCache() {
        const cacheSize = this.cache.keys().length;
        this.cache.flushAll();
        this.logs.push({
            action: 'CACHE_CLEARED',
            cacheSize: cacheSize,
            time: new Date().toISOString()
        });
        console.log(`Cache cleared - ${cacheSize} items removed`);
    }

    getCacheStats() {
        const keys = this.cache.keys();
        return {
            totalItems: keys.length,
            keys: keys
        };
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(` Caching Proxy Server running on port ${this.port}`);
            console.log(` Dashboard available at: http://localhost:${this.port}/dashboard`);
            console.log(` Proxying requests to: ${this.origin}`);
        });
    }
}

module.exports = CachingProxyServer;
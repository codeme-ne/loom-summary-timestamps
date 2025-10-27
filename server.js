const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const fs = require('fs');
const dotenv = require('dotenv');

['.env', '.env.local'].forEach((file) => {
    const envPath = path.join(__dirname, file);
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: true });
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API-Schlüssel aus Umgebungsvariable
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

function makeClaudeRequest(prompt) {
    if (!ANTHROPIC_API_KEY) {
        return Promise.reject(new Error('ANTHROPIC_API_KEY is not configured.'));
    }

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            model: ANTHROPIC_MODEL,
            max_tokens: 1000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        const options = {
            hostname: 'api.anthropic.com',
            port: 443,
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Proxy-Endpoint für Claude API
app.post('/api/claude', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const data = await makeClaudeRequest(prompt);
        res.json(data);
        
    } catch (error) {
        console.error('Claude API Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

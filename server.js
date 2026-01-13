const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.static(__dirname)); // Serve static files from root

// Routes

// Get Configuration
app.get('/api/config', (req, res) => {
    const configPath = path.join(__dirname, 'config.json');
    if (fs.existsSync(configPath)) {
        res.json(JSON.parse(fs.readFileSync(configPath, 'utf8')));
    } else {
        res.status(404).json({ error: 'Config file not found' });
    }
});

// Save Configuration
app.post('/api/config', (req, res) => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const newConfig = req.body;

        // Basic validation could go here

        fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
        console.log('Configuration updated via Admin Panel');
        res.json({ success: true, message: 'Configuration saved successfully' });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ success: false, message: 'Failed to save configuration' });
    }
});



// View Counter API
app.get('/api/view', (req, res) => {
    try {
        const viewsPath = path.join(__dirname, 'views.json');
        if (!fs.existsSync(viewsPath)) {
            fs.writeFileSync(viewsPath, JSON.stringify({ count: 0 }));
        }
        const data = JSON.parse(fs.readFileSync(viewsPath, 'utf8'));
        res.json({ count: data.count });
    } catch (e) {
        res.status(500).json({ count: 0 });
    }
});

app.post('/api/view', (req, res) => {
    try {
        const viewsPath = path.join(__dirname, 'views.json');
        let count = 0;

        if (fs.existsSync(viewsPath)) {
            const data = JSON.parse(fs.readFileSync(viewsPath, 'utf8'));
            count = data.count;
        }

        count++;
        fs.writeFileSync(viewsPath, JSON.stringify({ count }, null, 2));

        // Notify admin console
        // console.log(`New View! Total: ${count}`);

        res.json({ success: true, count });
    } catch (e) {
        console.error('View Count Error:', e);
        res.status(500).json({ error: 'Failed to increment view' });
    }
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin`);
});

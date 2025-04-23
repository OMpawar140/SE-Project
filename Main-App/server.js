const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

let clients = [];
let currentFolderStructure = {}; // Store the current folder structure
let previousFolderStructure = {}; // Store the previous structure for comparison

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Helper function to compare folder structures and mark updates
function markUpdatedNodes(oldNode, newNode) {
    if (!oldNode.isDir && !newNode.isDir) {
        if (oldNode.checksum !== newNode.checksum) {
            newNode.isUpdated = true;
            newNode.changeCount = (newNode.changeCount || 0) + 1; // Track the number of updates
        }
    } else if (oldNode.isDir && newNode.isDir) {
        for (let i = 0; i < newNode.children.length; i++) {
            if (oldNode.children[i]) {
                markUpdatedNodes(oldNode.children[i], newNode.children[i]);
            }
        }

        newNode.updatedFileCount = newNode.children.reduce((count, child) => {
            return count + (child.isUpdated ? 1 : 0);
        }, 0);
    }
}

// Endpoint to handle updates from the tutor
app.post('/api/update-structure', async (req, res) => {
    const folderStructure = req.body;

    // Check if folder name matches the previous one
    if (previousFolderStructure.name && previousFolderStructure.name === folderStructure.name) {
        // Compare and mark updated nodes
        markUpdatedNodes(previousFolderStructure, folderStructure);
    }

    // Update previous structure for future comparisons
    previousFolderStructure = folderStructure;

    // Update current structure
    currentFolderStructure = folderStructure;

    // Broadcast updated structure to all students
    broadcast(folderStructure);
    res.status(200).send({ message: 'Folder structure received and compared' });
});

// Broadcast the folder structure to all connected students
function broadcast(data) {
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

// SSE endpoint to send directory updates to students
app.get('/api/updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Immediately send the current folder structure upon connection
    if (Object.keys(currentFolderStructure).length > 0) {
        res.write(`data: ${JSON.stringify(currentFolderStructure)}\n\n`);
    }

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Endpoint to get file content
app.get('/api/file-content', (req, res) => {
    const filePath = req.query.path;
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Error reading file');
        }
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Student app running on http://localhost:${PORT}`);
});

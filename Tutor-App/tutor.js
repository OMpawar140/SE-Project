const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(express.static('public'));
app.use(bodyParser.json()); // to parse JSON request bodies

const ignoreList = ['node_modules', 'package-lock.json'];

async function getFolderStructure(directory) {
    const structure = {
        isDir: true,
        name: path.basename(directory),
        path: directory,
        children: []
    };

    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const isDirectory = fs.statSync(filePath).isDirectory();

        if (ignoreList.includes(file)) {
            continue;
        }

        if (isDirectory) {
            const childStructure = await getFolderStructure(filePath);
            structure.children.push(childStructure);
        } else {
            const fileChecksum = await calculateChecksum(filePath);
            structure.children.push({
                isDir: false,
                name: file,
                path: filePath,
                type: path.extname(file),
                checksum: fileChecksum
            });
        }
    }

    return structure;
}

function calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

let selectedFolder = '';

// ✅ UPDATED: Accept folder path from request body
app.post('/select-folder', (req, res) => {
    const { folderPath } = req.body;

    if (!folderPath || !fs.existsSync(folderPath)) {
        return res.status(400).send({ message: 'Invalid or non-existent folder path' });
    }

    selectedFolder = folderPath;
    res.send({ message: `Folder ${selectedFolder} selected!` });
});

app.post('/post-changes', async (req, res) => {
    if (!selectedFolder) {
        return res.status(400).send({ message: 'No folder selected!' });
    }

    const folderStructure = await getFolderStructure(selectedFolder);

    axios.post('http://localhost:3000/api/update-structure', folderStructure)
        .then(() => {
            res.send({ message: 'Folder structure sent successfully!' });
        })
        .catch(err => {
            res.status(500).send({ message: 'Failed to send structure to main server', error: err });
        });
});

app.listen(PORT, () => {
    console.log(`Tutor app running on http://localhost:${PORT}`);
});

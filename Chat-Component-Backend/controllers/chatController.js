const chatTree = require('../models/chatModel');
const { insertMessage, filterMessagesForStudents } = require('../utils/treeUtils');
const { getAnonymousName } = require('../services/anonymousService');

let chatEnabled = false;
const clients = []; // Store SSE client connections

// Send data to all connected clients
const broadcast = (data) => {
    clients.forEach((res) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

exports.toggleChat = (req, res) => {
    chatEnabled = req.body.enabled;

    broadcast({ type: 'chat-toggle', enabled: chatEnabled });
    res.status(200).json({ message: `Chat is now ${chatEnabled ? 'enabled' : 'disabled'}` });
};

exports.addMessage = (req, res) => {
    if (!chatEnabled) return res.status(403).json({ message: 'Chat is disabled' });

    const { content, sender, anonymous, parentId } = req.body;

    
    const message = {
        id: Date.now().toString(),
        content,
        sender: anonymous ? `${getAnonymousName(sender)}${"  "} ${sender}` : sender,
        timestamp: new Date().toISOString(),
        children: [],
    };

    // console.log(message);

    if (parentId) {
        if (!insertMessage(chatTree, message, parentId)) {
            return res.status(404).json({ message: 'Parent message not found' });
        }
    } else {
        chatTree.children.push(message);
    }

    broadcast({ type: 'new-message', message });
    res.status(201).json({ message: 'Message added successfully' });
};

exports.getMessages = (req, res) => {
    const { role } = req.query;
    if (role === 'teacher') {
        return res.status(200).json(chatTree);
    } else if (role === 'student') {
        return res.status(200).json(filterMessagesForStudents(chatTree));
    } else {
        return res.status(400).json({ message: 'Invalid role' });
    }
};

// Establish SSE connection
exports.streamUpdates = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    clients.push(res);

    // Remove client on disconnect
    req.on('close', () => {
        const index = clients.indexOf(res);
        if (index !== -1) clients.splice(index, 1);
    });
};

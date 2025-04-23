// In-memory storage for chats
const chatTree = {
    id: 'root',
    content: null,
    sender: null,
    timestamp: null,
    children: [],
};

module.exports = chatTree;

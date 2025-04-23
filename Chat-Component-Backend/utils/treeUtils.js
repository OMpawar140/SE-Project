// Insert a message into the tree
exports.insertMessage = (root, message, parentId) => {
    if (root.id === parentId) {
        root.children.push(message);
        return true;
    }
    for (const child of root.children) {
        if (this.insertMessage(child, message, parentId)) return true;
    }
    return false;
};

// Filter messages for students
exports.filterMessagesForStudents = (root) => {
    const filteredNode = { ...root, children: [] };

    if (root.sender && root.sender.startsWith('Anonymous')) {
        filteredNode.sender = 'Anonymous';
    }

    filteredNode.children = root.children.map(this.filterMessagesForStudents);
    return filteredNode;
};

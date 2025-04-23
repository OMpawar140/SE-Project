const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const anonymousToggle = document.getElementById('anonymous-toggle');
const sendButton = document.getElementById('send-button');
const roleSelector = document.getElementById('role-selector');

// Chat messages storage
const chatMessages = [];

// Anonymous name mapping
const anonymousMapping = {};

// Generate a unique anonymous name
const getAnonymousName = (realName) => {
  if (!anonymousMapping[realName]) {
    anonymousMapping[realName] = `Anonymous${Object.keys(anonymousMapping).length + 1}`;
  }
  return anonymousMapping[realName];
};

// Render chat messages
const renderMessages = () => {
  const role = roleSelector.value;
  chatBox.innerHTML = '';

  chatMessages.forEach(({ content, sender, anonymous }) => {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    const senderName = role === 'teacher' 
      ? sender 
      : anonymous 
        ? 'Anonymous' 
        : sender;

    messageDiv.innerHTML = `
      <div class="sender">${senderName}:</div>
      <div class="content">${content}</div>
    `;

    chatBox.appendChild(messageDiv);
  });
};

// Handle sending a message
sendButton.addEventListener('click', () => {
  const content = messageInput.value.trim();
  if (!content) return;

  const sender = roleSelector.value === 'teacher' ? 'Teacher' : 'Student';
  const anonymous = anonymousToggle.checked;

  const message = {
    content,
    sender: anonymous ? getAnonymousName(sender) : sender,
    anonymous,
  };

  chatMessages.push(message);
  messageInput.value = '';
  renderMessages();
});

// Initial rendering
renderMessages();

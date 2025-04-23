const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/chat', chatRoutes);

// Serve static front-end files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

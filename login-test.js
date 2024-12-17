const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

// Serve static files from the "build" folder
app.use(express.static(path.join(__dirname, 'build')));

// Handle all routes and serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

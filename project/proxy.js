// proxy.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to return index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 5180;
app.listen(PORT, () => {
  console.log(`✅ AlefLabs frontend live on http://localhost:${PORT}`);
});

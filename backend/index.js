import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { TokenAnalyzer } from './src/TokenAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variable for data directory
const DATA_DIR = process.env.DATA_DIR || '/data';
const TOKEN_DATA_DIR = join(DATA_DIR, 'token_data');

// Ensure token data directory exists
async function initializeDataDirectory() {
  try {
    await fs.access(DATA_DIR);
    await fs.access(TOKEN_DATA_DIR);
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.mkdir(TOKEN_DATA_DIR, { recursive: true });
      console.log('Created data directories successfully');
    } catch (error) {
      console.error('Error creating data directories:', error);
      process.exit(1);
    }
  }
}

// Initialize data directory
await initializeDataDirectory();

app.post('/api/analyze', async (req, res) => {
  try {
    const { tokenId } = req.body;
    const analyzer = new TokenAnalyzer(tokenId, TOKEN_DATA_DIR);
    const result = await analyzer.analyze();
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/visualize/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const tokenDir = join(TOKEN_DATA_DIR, `${tokenId}_token_data`);
    const holdersPath = join(tokenDir, `${tokenId}_holders.csv`);
    const transactionsPath = join(tokenDir, `${tokenId}_transactions.csv`);

    const [holdersData, transactionsData] = await Promise.all([
      fs.readFile(holdersPath, 'utf8'),
      fs.readFile(transactionsPath, 'utf8')
    ]);

    res.json({
      holders: holdersData,
      transactions: transactionsData
    });
  } catch (error) {
    console.error('Visualization error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Token data directory: ${TOKEN_DATA_DIR}`);
});

import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const filePath = path.join(process.cwd(), 'precos.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const dados = JSON.parse(fileContents);
    res.status(200).json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao ler o cache de preços.', error: error.message });
  }
}
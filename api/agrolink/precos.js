import { promises as fs } from 'fs';
import path from 'path';

function parseDate(mesAno) {
  const [mesStr, anoStr] = mesAno.split('/');
  const meses = {
    Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
    Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12
  };
  return new Date(parseInt(anoStr), meses[mesStr] - 1);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const filePath = path.join(process.cwd(), 'precos.json');
    const fileContents = await fs.readFile(filePath, 'utf-8');
    const dados = JSON.parse(fileContents);

    const { produto, inicio, fim } = req.query;

    // Se não enviar nada, lista os produtos disponíveis
    if (!produto && !inicio && !fim) {
      return res.status(200).json({
        produtosDisponiveis: Object.keys(dados)
      });
    }

    // Tratamento dos filtros
    const produtosSolicitados = produto ? produto.split(',').map(p => p.trim()) : Object.keys(dados);
    const inicioDate = inicio ? parseDate(inicio) : null;
    const fimDate = fim ? parseDate(fim) : null;

    const resultado = {};

    for (const p of produtosSolicitados) {
      const infoProduto = dados[p];
      if (!infoProduto) continue;

      const dadosFiltrados = infoProduto.dados.filter(item => {
        const dataItem = parseDate(item.mesAno);
        if (inicioDate && dataItem < inicioDate) return false;
        if (fimDate && dataItem > fimDate) return false;
        return true;
      });

      resultado[p] = {
        unidade: infoProduto.unidade,
        dados: dadosFiltrados
      };
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar os dados.', error: error.message });
  }
}

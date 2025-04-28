import { promises as fs } from 'fs';
import path from 'path';

// Função para formatar as datas como MM/AAAA
function formatarData(mesAno) {
  const [mes, ano] = mesAno.split('/');
  const mesFormatado = mes.padStart(2, '0'); // Garantir dois dígitos
  return `${mesFormatado}/${ano}`;
}

// Função para mapear nome simples para nome correto
const mapaProdutos = {
  'milho': 'Milho Seco',
  'soja': 'Soja (Grão)',
  'frango': 'Frango',
  'suíno': 'Suíno',
  'suínos': 'Suíno',
  'leite': 'Leite',
  'acucar': 'Açúcar',
  'arroz': 'Arroz (em Casca)',
  'cafe': 'Café Arábica (Tipo 6)',
  'café': 'Café Arábica (Tipo 6)',
  'tomate': 'Tomate',
  'etanol anidro': 'Etanol Anidro',
  'etanol hidratado': 'Etanol Hidratado',
  'sorgo': 'Sorgo',
  'trigo': 'Trigo (Grão Nacional)',
  'vaca': 'Vaca-Gorda',
  'vaca-gorda': 'Vaca-Gorda',
  'cana': 'Cana-de-Açúcar',
  'cana-de-açúcar': 'Cana-de-Açúcar',
  'ovos': 'Ovos Brancos Grandes',
  'feijão': 'Feijão Carioca',
  'feijao': 'Feijão Carioca',
  // Você pode adicionar mais se quiser...
};

function corrigirNomeProduto(nome) {
  const chave = nome.toLowerCase().trim();
  return mapaProdutos[chave] || nome;
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

    const produtosSolicitados = produto
      ? produto.split(',').map(p => corrigirNomeProduto(p))
      : Object.keys(dados);

    const parseDate = (mesAno) => {
      const [mesStr, anoStr] = mesAno.split('/');
      return new Date(parseInt(anoStr), parseInt(mesStr) - 1);
    };

    const inicioDate = inicio ? parseDate(inicio) : null;
    const fimDate = fim ? parseDate(fim) : null;

    const produtosDisponiveis = [];

    for (const p of produtosSolicitados) {
      const infoProduto = dados[p];
      if (!infoProduto) continue;

      const dadosFiltrados = infoProduto.dados
        .map(item => ({
          mesAno: formatarData(item.mesAno),
          mediaNacional: item.mediaNacional
        }))
        .filter(item => {
          const dataItem = parseDate(item.mesAno);
          if (inicioDate && dataItem < inicioDate) return false;
          if (fimDate && dataItem > fimDate) return false;
          return true;
        });

      produtosDisponiveis.push({
        nome: p,
        unidade: infoProduto.unidade,
        dados: dadosFiltrados
      });
    }

    return res.status(200).json({ produtosDisponiveis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar os dados.', error: error.message });
  }
}

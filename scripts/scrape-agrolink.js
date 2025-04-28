import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';

const produtos = [
  { nome: 'Milho Seco', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/milho-seco-sc-60kg' },
  { nome: 'Soja (Grão)', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/soja-em-grao-sc-60kg' }
];

async function scrape() {
  const resultados = {};

  for (const produto of produtos) {
    const response = await axios.get(produto.url);
    const $ = cheerio.load(response.data);

    const table = $('table.table-main.orange').first();
    const rows = table.find('tbody tr');
    const dados = [];

    rows.each((_, row) => {
      const mesAno = $(row).find('th').first().text().trim();
      let nacionalText = $(row).find('td').eq(1).text().trim();
      nacionalText = nacionalText.replace(/\./g, '').replace(',', '.');

      if (mesAno && nacionalText) {
        const nacional = parseFloat(nacionalText);
        if (!isNaN(nacional)) {
          dados.push({ mesAno, mediaNacional: nacional });
        }
      }
    });

    resultados[produto.nome] = {
      unidade: produto.unidade,
      dados,
    };
  }

  await fs.writeFile('precos.json', JSON.stringify(resultados, null, 2), 'utf-8');
  console.log('Arquivo precos.json atualizado!');
}

scrape().catch(err => {
  console.error('Erro no scraping:', err);
  process.exit(1);
});
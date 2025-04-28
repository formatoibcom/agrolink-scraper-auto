import axios from 'axios';
import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';

const produtos = [
  { nome: 'Açúcar', unidade: 'Saca 50Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/acucar-sc-50kg' },
  { nome: 'Arroz (em Casca)', unidade: 'Saca 50Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/arroz-em-casca-sc-60kg' },
  { nome: 'Batata', unidade: 'Saca 50Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/batata-comum-sc-50kg' },
  { nome: 'Boi Gordo', unidade: '15Kg (arroba)', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/boi-gordo-15kg' },
  { nome: 'Café Arábica (Tipo 6)', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/cafe-arabica-tipo-6-sc-60kg' },
  { nome: 'Cana-de-Açúcar', unidade: '1 Tonelada', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/cana-de-acucar-1ton' },
  { nome: 'Etanol Anidro', unidade: '1 Litro', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/etanol-anidro-1l' },
  { nome: 'Etanol Hidratado', unidade: '1 Litro', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/etanol-hidratado-1l' },
  { nome: 'Feijão Carioca', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/feijao-carioca-sc-60kg' },
  { nome: 'Frango', unidade: '1 Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/frango-1kg' },
  { nome: 'Leite', unidade: '1 Litro', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/leite-1l' },
  { nome: 'Milho Seco', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/milho-seco-sc-60kg' },
  { nome: 'Ovos Brancos Grandes', unidade: 'Caixa 30 Dúzias', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/ovos-granja-brancos-grande-cx-30dz' },
  { nome: 'Soja (Grão)', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/soja-em-grao-sc-60kg' },
  { nome: 'Sorgo', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/sorgo-sc-60kg' },
  { nome: 'Suíno', unidade: '1 Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/suino-1kg' },
  { nome: 'Tomate', unidade: '1 Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/tomate-1kg' },
  { nome: 'Trigo (Grão Nacional)', unidade: 'Saca 60Kg', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/trigo-em-grao-nacional-sc-60kg' },
  { nome: 'Vaca-Gorda', unidade: '15Kg (arroba)', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/vaca-gorda-15kg' }
];

async function scrape() {
  const resultados = {};

  for (const produto of produtos) {
    try {
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

      console.log(`✅ Coletado: ${produto.nome}`);

    } catch (error) {
      console.error(`❌ Erro ao coletar ${produto.nome}:`, error.message);
    }
  }

  await fs.writeFile('precos.json', JSON.stringify(resultados, null, 2), 'utf-8');
  console.log('🎯 Arquivo precos.json atualizado com sucesso!');
}

scrape().catch(err => {
  console.error('🚨 Erro geral no scraping:', err);
  process.exit(1);
});

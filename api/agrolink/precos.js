import { CheerioCrawler } from 'crawlee';

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
    { nome: 'Vaca-Gorda', unidade: '15Kg (arroba)', url: 'https://www.agrolink.com.br/cotacoes/historico/sp/vaca-gorda-15kg' },
];

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    const resultados = {};

    const crawler = new CheerioCrawler({
        async requestHandler({ $, request }) {
            const produto = produtos.find(p => p.url === request.url)?.nome || 'desconhecido';
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

            const unidade = produtos.find(p => p.url === request.url)?.unidade || '';
            resultados[produto] = { unidade, dados };
        },
    });

    try {
        await crawler.run(produtos.map(p => p.url));
        return res.status(200).json(resultados);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao realizar scraping.', error: error.message });
    }
}
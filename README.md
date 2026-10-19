# Bravo Barbearia — versão 4.1

Site demonstrativo com tela de entrada própria e abertura fotográfica, serviços em abas, contadores, galeria e páginas de localização e contato. Marca, preços, profissionais e endereço são ilustrativos. Agendamentos e mensagens não são enviados no modo demonstração.

## Nesta versão

- Identidade em carvão, marfim e cobre, com fotografias amplas e tipografia local.
- Entrada própria com monograma, nome, botão para entrar e acesso direto aos serviços, localização e contato. Transição suave e suporte a movimento reduzido.
- Navegação por âncoras com indicador da seção ativa e histórico do navegador preservado.
- Quatro serviços em abas, com troca de foto e preço animado; controle por teclado.
- Contadores derivados do catálogo: quatro serviços, duração entre 30 e 70 minutos, seis dias de atendimento.
- Galeria com rolagem nativa, botões e suporte a toque e teclado.
- Transições entre páginas nos navegadores compatíveis e fallback nativo nos demais.
- Movimento reduzido, pausa das animações e conteúdo utilizável sem JavaScript.
- Removidos os depoimentos fictícios, os textos decorativos repetitivos e as camadas antigas de animação.
- Imagem inicial prioritária, imagens WebP responsivas e fontes locais. Nenhuma biblioteca externa de interface ou animação é necessária.

## Abrir e publicar

No pacote para download, abra index.html após extrair todos os arquivos. A entrada leva a barbearia.html. A rota barbearia.html continua funcionando, inclusive com #servicos e #experiencia.

Na Vercel: Framework Other, comando `npm run build`, pasta de saída `dist`. O arquivo vercel.json já declara essas opções. Use como Root Directory a pasta que contém package.json. Não envie node_modules.

O build é executado com Node.js 24.x e não instala dependências de produção. O projeto de desenvolvimento usa source/; o pacote de download funciona com as páginas diretamente na raiz. Ambos são aceitos por build.mjs.

## Personalizar

- assets/site.css: aparência e ajustes responsivos.
- assets/experience.js: abas, indicadores, contadores, galeria e movimento.
- assets/app.js: agendamento, contato, privacidade e cookies.
- assets/config.js: demo, WhatsApp, mapa e análise de visitas.
- assets/analytics.js: carregamento opcional de análise mediante consentimento.

Para uma empresa real, substitua todos os dados demonstrativos. Configure o número autorizado em whatsapp e o endereço oficial em maps. Ao trocar demo para false, o site prepara uma solicitação para o visitante enviar pelo WhatsApp. A equipe deve confirmar a disponibilidade; o site não consulta uma agenda externa nem cobra pagamentos.

Atualize domínio, canonical, Open Graph, JSON-LD, robots.txt e sitemap.xml ao publicar em outro endereço. O ZIP específico para a Vercel já utiliza https://bravoo-gray.vercel.app. O projeto no Sites usa seu próprio endereço.

## Verificação realizada

Build sem dependências externas e 373 verificações de estrutura e comportamento em DOM simulado: arquivos locais, âncoras, metadados, textos alternativos, rótulos, abas e teclado, menu, escolha de serviço, horários, validação, resumo e conclusão demonstrativa, contato, privacidade e movimento reduzido.

Revisão visual em navegador real, Lighthouse, FPS e dispositivos físicos não foram verificados neste ambiente. Os estilos incluem faixas para desktop, tablet e celular. Não há garantia de pontuação de desempenho ou ranqueamento.

## Recursos

Fotografias preservadas do projeto Bravo, produzidas para a demonstração. Fontes e ícone do WhatsApp têm suas licenças em assets/. A referência Barbearia Gallo orientou o ritmo de navegação e os tipos de movimento; sua marca, seus textos, imagens e números não foram copiados.

## Entrada da versão 4.1

assets/entrance.css e assets/entrance.js controlam a entrada. O botão é um link nativo: funciona sem JavaScript. A animação de saída respeita teclas modificadoras, movimento reduzido e Voltar do navegador. Links antigos para index.html#servicos são encaminhados para a página principal.

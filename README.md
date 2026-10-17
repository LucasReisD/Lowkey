# LOWKEY — Marketplace experimental

Protótipo front-end de marketplace com identidade visual underground, inspirado em streetwear, skate, cultura DIY e arte digital.

## Como executar

- Abra `index.html` no navegador, ou publique a pasta na Vercel como projeto estático.
- Não há etapa de build nem dependências locais. Os ícones e fontes são carregados por CDN.

## Funcionalidades

- Catálogo de demonstração conectado à FakeStoreAPI (`https://fakestoreapi.com/products`).
- Busca, filtros por categoria/preço/avaliação e ordenação.
- Favoritos, carrinho e ajuste de quantidades em memória durante a sessão.
- Tema claro/escuro com preferência salva no `localStorage`.
- Estados de carregamento, fallback de catálogo e aviso de checkout demonstrativo.
- Seções conceituais LOWKEY LAB e API LAB.

## Transparência dos dados

Este é um protótipo de portfólio, não uma loja comercial. A FakeStoreAPI fornece dados fictícios/demonstrativos. Os preços retornados pela API são multiplicados por 5,15 para exibição ilustrativa em BRL; isso **não** é cotação cambial nem preço real de venda. O checkout não processa pagamentos e não há inventário real.

## Tecnologias

HTML · CSS · JavaScript · REST API · Lucide CDN · Google Fonts

## Próximas etapas sugeridas

- Validar e implementar a geração de imagens no LOWKEY LAB com a documentação atual da Pollinations.ai.
- Persistir carrinho e favoritos localmente se desejado.
- Adicionar testes em dispositivos móveis e revisar acessibilidade.
- Integrar backend, inventário e pagamento apenas quando houver requisitos comerciais definidos.

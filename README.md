# Sakura Guitars — Railway Ready

Loja de acessórios de guitarra com catálogo, busca, páginas individuais de produto, carrinho, painel administrativo e checkout Mercado Pago.

## Publicar no Railway

### 1. Suba o projeto para o GitHub
Crie um repositório e envie todos estes arquivos para ele.

### 2. Crie o serviço no Railway
No Railway, crie um novo projeto e escolha **Deploy from GitHub Repo**. Selecione o repositório da Sakura Guitars.

O projeto já contém `railway.json` e o comando de inicialização é `npm start`.

### 3. Configure as variáveis
No serviço do Railway, abra **Variables** e crie:

- `MP_ACCESS_TOKEN` = seu Access Token de produção/teste do Mercado Pago
- `ADMIN_PASSWORD` = uma senha forte para o painel `/admin`
- `BASE_URL` = URL pública da loja no Railway, por exemplo `https://sakura-guitars-production.up.railway.app`

Não coloque o Access Token diretamente no código nem publique o `.env`.

O Railway fornece a variável `PORT` automaticamente; o servidor já usa essa variável.

### 4. Gere o domínio público
No serviço do Railway, use a opção de domínio público para receber um endereço `*.up.railway.app`. Depois coloque esse endereço em `BASE_URL`.

## Rodar localmente

1. Node.js 20+
2. `npm install`
3. copie `.env.example` para `.env`
4. preencha as variáveis
5. `npm start`
6. loja: `http://localhost:3000`
7. admin: `http://localhost:3000/admin`

## Importante antes de vender de verdade

A versão atual salva produtos em `products.json`. Em hospedagens como Railway, o disco do serviço não deve ser tratado como banco de dados permanente. Para produção, o próximo passo recomendado é migrar produtos e pedidos para PostgreSQL (por exemplo, o PostgreSQL do próprio Railway).

O checkout Mercado Pago está preparado, mas ainda faltam webhook de pagamento, persistência de pedidos, baixa de estoque após pagamento, cálculo de frete e integração automática com um fornecedor de dropshipping específico.

## Dropshipping

Os produtos já possuem campos para custo, fornecedor, URL do fornecedor, SKU, estoque, variações e envio. A automação de estoque, preço, pedido e rastreio depende da API/plataforma do fornecedor escolhido.

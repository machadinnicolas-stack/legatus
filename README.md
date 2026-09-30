# Fôlego

Aplicativo mobile-first para quem compra parcelado e quer saber quanto do próximo salário já está comprometido.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` — ou a porta indicada pelo Next.js caso ela já esteja ocupada.

## Validações

```bash
npm run lint
npm run build
```

## Estado atual

- Onboarding com salário líquido, gastos fixos e dia de pagamento
- Cadastro e acompanhamento de parcelas
- Registro mensal de pagamentos
- Margem estimada depois dos compromissos informados
- Previsão visual dos próximos 12 meses
- Simulador “Posso parcelar isso?”
- Histórico de parcelas concluídas
- Persistência local, sem conexão bancária ou login

## Próxima etapa

Validar a proposta com conteúdo orgânico e acompanhar quantas pessoas concluem a primeira simulação antes de adicionar cobrança e autenticação.

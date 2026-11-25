/**
 * Os limites de chamadas por visitante. O geral (100 por minuto, no server.ts) vale para as rotas que mudam alguma
 * coisa ou fazem conta (a conclusão, a senha). As leituras (a saúde, o negócio, as fases) têm um limite maior: cada
 * página do site pede duas ou três delas, e quem troca de fase depressa passaria dos 100.
 */
export const LEITURA = { rateLimit: { max: 600, timeWindow: '1 minute' } }

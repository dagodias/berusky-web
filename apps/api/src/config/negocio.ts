/**
 * Os dados do jogo, num lugar só. Neste projeto, o "negócio" do kit é o próprio jogo.
 * Com o banco ligado (o comando /ligar-banco), estes dados passam a morar nele e este arquivo vira a semente.
 */
import type { Negocio } from '@projeto/shared'

export const negocio: Negocio = {
  nome: 'Berusky',
  frase: 'O jogo de lógica das cinco joaninhas, agora no navegador.',
  // O código-fonte vem primeiro: a GPL pede que quem joga consiga chegar nele.
  links: [
    { nome: 'Código-fonte (GPL)', endereco: 'https://github.com/dagodias/berusky-web' },
    { nome: 'O Berusky original', endereco: 'https://www.anakreon.cz/berusky1.html' },
  ],
}

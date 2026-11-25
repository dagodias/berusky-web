/**
 * A cara do site que não é dado do jogo: o menu e o endereço do site.
 * O nome, a frase e os links moram na API (apps/api/src/config/negocio.ts). A logo é o arquivo public/logo.svg; a
 * fonte e as cores, o assets/css/main.css.
 */
export default defineAppConfig({
  /** O menu do topo e do rodapé, na ordem em que aparece. Página nova que deve aparecer no menu entra aqui. */
  menu: [
    { rotulo: 'Início', para: '/' },
    { rotulo: 'Sobre', para: '/sobre' },
  ],
  /**
   * O endereço do site, quando ele tiver domínio (por exemplo, https://berusky.exemplo.com.br), sem a barra no fim.
   * Ele completa a prévia do link (quando alguém compartilha o site) e o endereço oficial de cada página para o
   * Google. Vazio até lá.
   */
  enderecoDoSite: '',
})

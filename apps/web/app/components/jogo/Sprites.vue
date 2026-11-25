<script setup lang="ts">
/**
 * Os desenhos das peças do jogo, todos em 64 × 64, num <svg> invisível: o tabuleiro usa cada um com <use>. Vai uma
 * vez por página, antes do tabuleiro. Arte nova, feita para esta versão (nenhum desenho do original).
 * As peças coloridas pintam com a variável --cor, que o tabuleiro passa a cada uma.
 */
</script>

<template>
  <svg width="0" height="0" class="absolute" aria-hidden="true" focusable="false">
    <defs>
      <!-- A joaninha, olhando para cima (o tabuleiro gira). O número vai por cima, de pé, no tabuleiro. -->
      <symbol id="jogo-besouro" viewBox="0 0 64 64">
        <ellipse cx="32" cy="39" rx="21" ry="21" fill="#000" opacity=".18" />
        <g stroke="#1f2937" stroke-width="3" stroke-linecap="round">
          <path d="M14 28 8 23M13 37H6M14 46l-6 5M50 28l6-5M51 37h7M50 46l6 5" />
        </g>
        <g fill="none" stroke="#1f2937" stroke-width="2.4" stroke-linecap="round">
          <path d="M27 10q-3-5-7-6M37 10q3-5 7-6" />
        </g>
        <circle cx="20" cy="4" r="2.5" fill="#1f2937" />
        <circle cx="44" cy="4" r="2.5" fill="#1f2937" />
        <ellipse cx="32" cy="15" rx="11" ry="9" fill="#1f2937" />
        <circle cx="27.5" cy="12.5" r="3.2" fill="#fff" />
        <circle cx="36.5" cy="12.5" r="3.2" fill="#fff" />
        <circle cx="27.5" cy="11.8" r="1.6" fill="#111827" />
        <circle cx="36.5" cy="11.8" r="1.6" fill="#111827" />
        <ellipse cx="32" cy="37" rx="20" ry="21" fill="var(--cor, #ef4444)" />
        <ellipse cx="32" cy="41" rx="20" ry="17" fill="#000" opacity=".08" />
        <path d="M32 17v40" stroke="#1f2937" stroke-opacity=".55" stroke-width="2" />
        <g fill="#1f2937" opacity=".85">
          <circle cx="22.5" cy="30" r="4" />
          <circle cx="41.5" cy="30" r="4" />
          <circle cx="21.5" cy="45" r="3.4" />
          <circle cx="42.5" cy="45" r="3.4" />
        </g>
        <ellipse
          cx="24"
          cy="24"
          rx="6"
          ry="3.5"
          fill="#fff"
          opacity=".4"
          transform="rotate(-30 24 24)"
        />
      </symbol>

      <!-- A caixa de madeira. -->
      <symbol id="jogo-caixa" viewBox="0 0 64 64">
        <rect x="7" y="11" width="50" height="49" rx="9" fill="#000" opacity=".22" />
        <rect x="7" y="6" width="50" height="50" rx="9" fill="#c98b4b" />
        <rect x="13" y="12" width="38" height="38" rx="5" fill="#b9793b" />
        <path
          d="m16 15 32 32M48 15 16 47"
          stroke="#8a5a2c"
          stroke-width="5"
          stroke-linecap="round"
          opacity=".7"
        />
        <rect
          x="7"
          y="6"
          width="50"
          height="50"
          rx="9"
          fill="none"
          stroke="#7a4d24"
          stroke-width="3"
        />
        <path d="M14 9.5h36" stroke="#e8b47c" stroke-width="2" stroke-linecap="round" />
      </symbol>

      <!-- A caixa leve: papelão, com a fita. -->
      <symbol id="jogo-caixa-leve" viewBox="0 0 64 64">
        <rect x="9" y="12" width="46" height="46" rx="6" fill="#000" opacity=".18" />
        <rect x="9" y="8" width="46" height="46" rx="6" fill="#ecd3a2" />
        <rect x="27" y="8" width="10" height="46" fill="#f7e8c9" />
        <rect
          x="9"
          y="8"
          width="46"
          height="46"
          rx="6"
          fill="none"
          stroke="#b98f54"
          stroke-width="2.5"
        />
        <path d="M15 46h8M15 41h5" stroke="#b98f54" stroke-width="2" stroke-linecap="round" />
      </symbol>

      <!-- O explosivo: três bananas com o pavio aceso. -->
      <symbol id="jogo-explosivo" viewBox="0 0 64 64">
        <ellipse cx="32" cy="56" rx="21" ry="5" fill="#000" opacity=".2" />
        <rect x="12" y="19" width="13" height="37" rx="6" fill="#dc2626" />
        <rect x="25.5" y="17" width="13" height="39" rx="6" fill="#ef4444" />
        <rect x="39" y="19" width="13" height="37" rx="6" fill="#dc2626" />
        <path
          d="M16 22v28M29.5 20v30M43 22v28"
          stroke="#fff"
          stroke-opacity=".3"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <rect x="10" y="33" width="44" height="8" rx="3" fill="#1f2937" />
        <path
          d="M32 17q1-8 10-10"
          fill="none"
          stroke="#374151"
          stroke-width="2.6"
          stroke-linecap="round"
        />
        <circle cx="43" cy="7" r="5" fill="#fbbf24" />
        <circle cx="43" cy="7" r="2.2" fill="#fff7ed" />
      </symbol>

      <!-- A pedra. -->
      <symbol id="jogo-pedra" viewBox="0 0 64 64">
        <path
          d="M10 44q-3-17 11-25 13-8 26-1 12 7 9 22-3 17-23 18-19 1-23-14Z"
          fill="#000"
          opacity=".2"
        />
        <path d="M10 39q-3-17 11-25 13-8 26-1 12 7 9 22-3 17-23 18-19 1-23-14Z" fill="#a3acb6" />
        <path d="M12 44q4 11 21 10 18-1 22-15-6 11-22 11-14 0-21-6Z" fill="#7d8792" />
        <path
          d="m26 22 5 9-4 7m13-14-3 8 6 5"
          fill="none"
          stroke="#6b7480"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <ellipse
          cx="24"
          cy="18"
          rx="7"
          ry="3.5"
          fill="#fff"
          opacity=".35"
          transform="rotate(-25 24 18)"
        />
      </symbol>

      <!-- A picareta. -->
      <symbol id="jogo-picareta" viewBox="0 0 64 64">
        <path
          d="m19 52 28-34"
          stroke="#000"
          stroke-opacity=".18"
          stroke-width="8"
          stroke-linecap="round"
        />
        <path d="m17 49 28-34" stroke="#9a6233" stroke-width="7" stroke-linecap="round" />
        <path d="m17 49 28-34" stroke="#c4894f" stroke-width="2.5" stroke-linecap="round" />
        <path
          d="M15 22q15-16 37-10"
          fill="none"
          stroke="#64748b"
          stroke-width="8"
          stroke-linecap="round"
        />
        <path
          d="M17 20q14-13 33-8"
          fill="none"
          stroke="#cbd5e1"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </symbol>

      <!-- A chave da saída: dourada. -->
      <symbol id="jogo-chave" viewBox="0 0 64 64">
        <g transform="translate(1 4)" opacity=".2">
          <circle cx="22" cy="22" r="10" fill="none" stroke="#000" stroke-width="7" />
          <path
            d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
            stroke="#000"
            stroke-width="7"
            stroke-linecap="round"
          />
        </g>
        <circle cx="22" cy="22" r="10" fill="none" stroke="#d97706" stroke-width="7" />
        <path
          d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
          stroke="#d97706"
          stroke-width="7"
          stroke-linecap="round"
        />
        <circle cx="22" cy="22" r="10" fill="none" stroke="#fbbf24" stroke-width="3.5" />
        <path
          d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
          stroke="#fbbf24"
          stroke-width="3"
          stroke-linecap="round"
        />
        <path d="M49 8v8m-4-4h8" stroke="#fff" stroke-width="2" stroke-linecap="round" />
      </symbol>

      <!-- A chave colorida: só o besouro da mesma cor pega. -->
      <symbol id="jogo-chave-colorida" viewBox="0 0 64 64">
        <g transform="translate(1 4)" opacity=".2">
          <circle cx="22" cy="22" r="10" fill="none" stroke="#000" stroke-width="7" />
          <path
            d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
            stroke="#000"
            stroke-width="7"
            stroke-linecap="round"
          />
        </g>
        <circle cx="22" cy="22" r="10" fill="none" stroke="#1f2937" stroke-width="8" />
        <path
          d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
          stroke="#1f2937"
          stroke-width="8"
          stroke-linecap="round"
        />
        <circle cx="22" cy="22" r="10" fill="none" stroke="var(--cor)" stroke-width="5" />
        <path
          d="m29 29 21 21m-7-7 5-5m-1 11 5-5"
          stroke="var(--cor)"
          stroke-width="5"
          stroke-linecap="round"
        />
      </symbol>

      <!--
        As portas: desenhadas de passar na horizontal (a folha em pé, entre a parede de cima e a de baixo).
        As de passar na vertical usam o mesmo desenho, deitado.
      -->
      <symbol id="jogo-porta-fechada" viewBox="0 0 64 64">
        <rect x="19" y="0" width="26" height="64" fill="#000" opacity=".25" />
        <rect x="20" y="0" width="24" height="64" rx="3" fill="var(--cor)" />
        <rect x="24" y="5" width="16" height="54" rx="3" fill="#fff" opacity=".2" />
        <circle cx="32" cy="29" r="4.5" fill="#1f2937" />
        <path d="M32 31v8" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" />
      </symbol>

      <symbol id="jogo-porta-aberta" viewBox="0 0 64 64">
        <rect x="20" y="0" width="24" height="10" rx="3" fill="var(--cor, #94a3b8)" />
        <rect x="20" y="54" width="24" height="10" rx="3" fill="var(--cor, #94a3b8)" />
        <path
          d="M32 14v36"
          stroke="var(--cor, #94a3b8)"
          stroke-opacity=".45"
          stroke-width="2.5"
          stroke-dasharray="4 5"
          stroke-linecap="round"
        />
      </symbol>

      <!-- A passagem colorida: só o besouro da cor passa (por isso, a joaninha no lugar da fechadura). -->
      <symbol id="jogo-passagem-fechada" viewBox="0 0 64 64">
        <rect x="19" y="0" width="26" height="64" fill="#000" opacity=".25" />
        <rect x="20" y="0" width="24" height="64" rx="3" fill="var(--cor)" />
        <path
          d="M24 4v56M40 4v56"
          stroke="#fff"
          stroke-opacity=".28"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="32" cy="32" r="8.5" fill="#fff" opacity=".9" />
        <circle cx="32" cy="25.5" r="3.2" fill="#1f2937" />
        <path d="M32 27v12" stroke="#1f2937" stroke-width="1.6" />
        <circle cx="29" cy="32" r="1.6" fill="#1f2937" />
        <circle cx="35" cy="32" r="1.6" fill="#1f2937" />
      </symbol>

      <symbol id="jogo-passagem-aberta" viewBox="0 0 64 64">
        <rect x="20" y="0" width="24" height="10" rx="3" fill="var(--cor)" />
        <rect x="20" y="54" width="24" height="10" rx="3" fill="var(--cor)" />
        <circle
          cx="32"
          cy="32"
          r="8.5"
          fill="none"
          stroke="var(--cor)"
          stroke-width="2.5"
          opacity=".6"
        />
        <circle cx="32" cy="25.5" r="2.6" fill="var(--cor)" opacity=".6" />
      </symbol>

      <!-- A porta de uma passagem só: aberta, com a seta; fechada para sempre, com o X. -->
      <symbol id="jogo-uma-vez-aberta" viewBox="0 0 64 64">
        <rect x="20" y="0" width="24" height="10" rx="3" fill="#94a3b8" />
        <rect x="20" y="54" width="24" height="10" rx="3" fill="#94a3b8" />
        <circle cx="32" cy="32" r="10" fill="#f1f5f9" stroke="#64748b" stroke-width="2.5" />
        <text
          x="32"
          y="37"
          text-anchor="middle"
          font-size="14"
          font-weight="800"
          fill="#475569"
          font-family="inherit"
        >
          1
        </text>
      </symbol>

      <symbol id="jogo-uma-vez-fechada" viewBox="0 0 64 64">
        <rect x="19" y="0" width="26" height="64" fill="#000" opacity=".25" />
        <rect x="20" y="0" width="24" height="64" rx="3" fill="#64748b" />
        <path
          d="m25 25 14 14m0-14L25 39"
          stroke="#e2e8f0"
          stroke-width="4"
          stroke-linecap="round"
        />
      </symbol>

      <!-- A saída: o portal. As cinco luzes (uma por chave) o tabuleiro acende por cima. -->
      <symbol id="jogo-saida" viewBox="0 0 64 64">
        <path d="M8 62V31a24 24 0 0 1 48 0v31Z" fill="#000" opacity=".2" />
        <path d="M8 60V29a24 24 0 0 1 48 0v31Z" fill="#475569" />
        <path d="M16 60V30a16 16 0 0 1 32 0v30Z" fill="#0f172a" />
        <path d="M22 60V32a10 10 0 0 1 20 0v28Z" fill="#1e293b" />
      </symbol>

      <symbol id="jogo-saida-aberta" viewBox="0 0 64 64">
        <path d="M8 62V31a24 24 0 0 1 48 0v31Z" fill="#000" opacity=".2" />
        <path d="M8 60V29a24 24 0 0 1 48 0v31Z" fill="#15803d" />
        <path d="M16 60V30a16 16 0 0 1 32 0v30Z" fill="#bbf7d0" />
        <path d="M22 60V32a10 10 0 0 1 20 0v28Z" fill="#f0fdf4" />
      </symbol>
    </defs>
  </svg>
</template>

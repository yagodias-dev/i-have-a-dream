# DESIGN.md — Martin Luther King Jr. · 1929–1968

Sistema visual do site. Tudo o que for novo segue estas regras. Os valores vivem como variáveis CSS no topo de `style.css`.

## 1. Direção

Revista de documentário histórico: solene, humana, com a fotografia de arquivo no centro. A página se lê como uma edição especial impressa — títulos grandes em serifa de alto contraste, texto corrido confortável, rótulos de arquivo em monoespaçada, filetes finos separando blocos.

**Nunca:** gradiente roxo/lilás, cards idênticos enfileirados, emojis como ícones, sombras difusas genéricas, glassmorphism, cantos muito arredondados, brilho neon.

## 2. Cor

Tema escuro é o padrão. O tema claro ("papel") é alternado pelo botão no menu e fica salvo no navegador.

| Token | Escuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#15110d` | `#f2ebdf` | Fundo da página (grafite quente / papel) |
| `--bg-2` | `#1d1813` | `#e9e0d0` | Faixas alternadas, painéis |
| `--bg-3` | `#28211a` | `#ddd2bf` | Molduras de foto vazias, trilhos |
| `--ink` | `#efe7da` | `#1c1712` | Texto principal (off-white / tinta) |
| `--ink-2` | `#bcb09d` | `#55493c` | Texto secundário, legendas |
| `--ink-3` | `#8d8170` | `#7a6c5b` | Somente rótulos ≥ 14px e decoração |
| `--gold` | `#d9a441` | `#8a5a10` | Destaque: datas, números, foco, links ativos |
| `--brick` | `#d0694c` | `#9c3b22` | Tom secundário: memória, alertas, respostas erradas |
| `--line` | `rgba(239,231,218,.14)` | `rgba(28,23,18,.16)` | Filetes e bordas |

Contraste AA verificado: `--ink` e `--ink-2` sobre `--bg` e `--bg-2` passam 4,5:1 nos dois temas; `--gold` e `--brick` passam 4,5:1 sobre `--bg` (texto normal). `--ink-3` não é usado para texto corrido.

Proporção de uso: ~85% fundo e tinta, ~10% dourado, ~5% tijolo. O dourado marca **o que é tempo** (anos, datas, números); o tijolo marca **o que é perda ou erro** (mortes, violência, resposta errada no quiz).

## 3. Tipografia

| Papel | Família | Fallback | Uso |
|---|---|---|---|
| Display | **Bodoni Moda** (opsz, 400–700, itálico) | `"Didot", "Bodoni 72", Georgia, serif` | h1, h2, h3, citações, números grandes. Nunca abaixo de 22px |
| Texto | **Public Sans** (400–700) | `system-ui, "Segoe UI", Arial, sans-serif` | Parágrafos, botões, navegação |
| Arquivo | **IBM Plex Mono** (400–500) | `ui-monospace, Consolas, monospace` | Rótulos, datas pequenas, créditos, contadores |

Public Sans é a fonte do sistema de design do governo dos EUA — uma escolha discreta e temática para uma história de leis e direitos.

Escala (fluida, `clamp`):

- `--t-hero`: 3.4rem → 9.5rem (h1)
- `--t-h2`: 2.4rem → 5.2rem
- `--t-h3`: 1.6rem → 2.6rem
- `--t-quote`: 1.7rem → 3.6rem
- `--t-lead`: 1.15rem → 1.45rem
- `--t-body`: 1.0625rem (17px), altura de linha 1.7, medida máxima 64ch
- `--t-label`: 0.78rem, mono, caixa alta, espaçamento 0.14em

Itálico da Bodoni para a palavra-chave de cada título (`<em>`), em dourado.

## 4. Espaço e grade

- Base de 8px. Tokens `--s-1` (8) a `--s-9` (160).
- Container `.wrap`: `min(1240px, 100% - 2 × gutter)`, gutter `clamp(20px, 5vw, 64px)`. As bordas esquerda e direita do conteúdo são sempre iguais.
- Grade editorial de 12 colunas a partir de 900px; uma coluna abaixo disso.
- Seções com respiro vertical `clamp(96px, 14vh, 180px)`. Densidade baixa: no máximo uma ideia por bloco.

## 5. Componentes

- **Rótulo de seção** (`.kicker`): número da seção em mono + filete + nome. Ex.: `03 — Linha do tempo`.
- **Foto de arquivo** (`.photo`): moldura com proporção fixa (`--ratio`), imagem em preto e branco levemente sépia; ganha a cor original ao passar o mouse ou focar. Zoom de 1.03 dentro da moldura. Sem imagem, mostra um espaço reservado elegante com o título do arquivo.
- **Número em destaque** (`.fact`): número em Bodoni dourado + rótulo curto em texto secundário. Sempre em grupos de 2 a 4, nunca em fileira de 8 iguais.
- **Citação** (`.quote`): aspas grandes em tijolo, texto em Bodoni, original em inglês menor, fonte em mono.
- **Botão** (`.btn`): retângulo de canto 2px, texto em Public Sans 600. Primário: fundo dourado, texto `--bg`. Secundário: borda `--line`, texto `--ink`. Hover: sobe 2px; clique: afunda 1px.
- **Link de texto**: sublinhado que se desenha da esquerda para a direita no hover.
- **Foco**: contorno de 2px dourado com 3px de afastamento em todo elemento interativo.

Raio: `--r: 2px` em tudo. Sombras: só no lightbox e no menu móvel.

## 6. Movimento

Intensidade alta, sempre com propósito narrativo.

- **Entrada do hero**: a foto "revela" do grão para a imagem; o título sobe palavra por palavra por trás de uma máscara; os anos aparecem ligados por um filete que se desenha.
- **Revelação ao rolar**: blocos editoriais (não cards soltos) sobem 24px e aparecem; títulos entram palavra por palavra com ritmo de 70ms.
- **Linha do tempo**: o trilho se preenche conforme a rolagem; cada marcador acende ao cruzar o centro da tela.
- **Grão**: textura de ruído SVG fixa sobre a página, opacidade 0.06–0.08, levemente animada no desktop, estática no celular.
- **Fotos**: preto e branco → cor em 600ms.
- Curva padrão: `cubic-bezier(.2,.7,.1,1)`. Durações: 200ms (hover), 600ms (cor), 900ms (revelação).
- `prefers-reduced-motion: reduce`: tudo aparece imediatamente, grão parado, sem rolagem suave. Nada fica escondido.

## 7. Acessibilidade

Hierarquia de títulos h1 → h2 → h3 sem saltos; link "Pular para o conteúdo"; navegação inteira por teclado; foco visível; `aria` no menu, no lightbox (diálogo modal, Esc fecha, setas navegam, foco preso e devolvido), no carrossel de citações (`aria-roledescription="carousel"`, região viva educada) e no quiz (região viva com o resultado). Alvos de toque com no mínimo 44px.

## 8. Imagens

Arquivos em `assets/` com **o mesmo nome do arquivo no Wikimedia Commons**. Enquanto o arquivo local não existir, o script tenta a versão do Commons e, se falhar, mostra o espaço reservado. Cada `<figure>` leva `data-fonte` com a página do arquivo e um comentário `TROCAR POR IMAGEM: [título]`.

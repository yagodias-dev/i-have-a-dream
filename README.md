# Martin Luther King Jr. (1929–1968) — biografia ilustrada

Site biográfico sobre Martin Luther King Jr., em português, feito com HTML, CSS e JavaScript puros: sem framework e sem etapa de build. Funciona abrindo o `index.html` direto no navegador e é publicado no GitHub Pages.

## Estrutura

```
.
├── index.html   # conteúdo: menu, hero, linha do tempo, momentos, citações, galeria, legado, quiz, rodapé
├── style.css    # visual (tokens do DESIGN.md), animações e responsividade
├── script.js    # tema, menu, revelações, linha do tempo, carrossel, lightbox, quiz
├── DESIGN.md    # sistema visual: cores, tipografia, espaçamento, componentes, movimento
├── assets/      # fotos (baixe do Wikimedia Commons; veja abaixo)
└── .github/workflows/main.yml   # deploy automático no GitHub Pages
```

## Imagens

Cada foto procura primeiro `assets/<nome do arquivo no Commons>`. Se o arquivo não existir, o site carrega a mesma foto direto do Wikimedia Commons e, se isso também falhar, mostra um espaço reservado com o nome do arquivo.

Para usar só arquivos locais:

1. Baixe cada arquivo listado em **Créditos das imagens** (rodapé do site) e salve em `assets/` **com exatamente o mesmo nome**.
2. No `index.html`, no script do `<head>`, troque `var USAR_COMMONS = true;` por `false`.

No código, cada foto tem o comentário `TROCAR POR IMAGEM: <arquivo>` e o atributo `data-fonte` com a página do arquivo no Commons.

## Como publicar

1. Faça commit e push na branch `main`.
2. No GitHub, em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. Quando o workflow terminar, o site fica em `https://<usuario>.github.io/<repositorio>/`.

## Créditos

- Fotos: Wikimedia Commons (domínio público ou Creative Commons; autor e licença de cada uma no rodapé).
- Pesquisa: The Nobel Prize, King Institute (Stanford), The King Center, National Park Service, National Archives, Library of Congress e National Civil Rights Museum.
- Tipografia: Bodoni Moda, Public Sans e IBM Plex Mono (Google Fonts).

O site respeita a preferência do sistema por menos movimento (`prefers-reduced-motion`) e tem tema claro e escuro.

# Martin Luther King Jr. — O Sonho que Mudou a História

Site biográfico interativo sobre Martin Luther King Jr. (1929–1968), em português, feito com HTML, CSS e JavaScript puros — sem framework e sem etapa de build.

## Estrutura

```
.
├── index.html   # conteúdo (17 seções)
├── style.css    # visual, animações de entrada e responsividade
├── script.js    # abertura, rolagem, partículas, cursor, lightbox, linha do tempo
├── README.md
└── .github/workflows/main.yml   # deploy automático no GitHub Pages (já existe no repositório)
```

## Como publicar

1. Substitua `index.html`, `style.css` e `script.js` do repositório por estes arquivos e adicione este `README.md`. Mantenha a pasta `.github`.
2. Faça commit e push na branch `main`.
3. No GitHub, abra **Settings → Pages** e, em **Build and deployment → Source**, escolha **GitHub Actions**.
4. Acompanhe a aba **Actions**. Quando o workflow terminar, o site fica em `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.

Para testar no computador, abra a pasta no VS Code e use a extensão Live Server (ou rode `python -m http.server` e acesse `http://localhost:8000`).

## Créditos

- Fotos: Wikimedia Commons (domínio público ou licença livre). O crédito de cada foto leva à página do arquivo com autor e licença.
- Fontes de pesquisa: The Nobel Prize, King Institute (Stanford), The King Center, National Park Service, National Archives e Library of Congress.
- Tipografia: Playfair Display, Source Sans 3 e Special Elite (Google Fonts).

O site respeita a preferência do sistema por menos movimento e tem um botão "Movimento" no topo para desligar as animações.

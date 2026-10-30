# Future Works Summit — site atualizado

Landing page responsiva criada em HTML, CSS e JavaScript, sem dependências de frameworks. Preserva a identidade visual e a interação da versão fornecida e aplica as revisões solicitadas em 23/10/2026.

## Rodar ou publicar

Abra `index.html` no navegador ou publique **a pasta inteira** em uma hospedagem estática (Vercel, Netlify etc.), mantendo `assets/`, `styles.css` e `script.js` no mesmo diretório do HTML. Para desenvolvimento local, dentro da pasta execute `python -m http.server 8000`.

## Atualizações desta versão

- **Evento:** 10 e 11 de novembro de 2026, inclusive título de calendário, metadados de compartilhamento e informações de data no site.
- **Header:** transparente no topo, com transparência e leve desfoque ao rolar; logo oficial Future Works em tamanho reduzido.
- **Hero:** robô ao centro, chamada à esquerda e data, localização e gratuidade à direita; reorganização responsiva no celular.
- **Planeta:** centralizado na página, animação de revelação vertical de baixo para cima ao rolar e degradê preto na parte inferior.
- **Conexão humana e robótica:** mãos ocupando a largura integral da tela, sem margens laterais.
- **Experiências:** imagem fornecida do androide sentado e lendo jornal no lugar do robô anterior.
- **Instagram:** endereço @futureworkssummit clicável; sem QR Code.
- **Rodapé:** logos fornecidas do Future Works, Instituto DNA Social e Secretaria de Ciência, Tecnologia e Inovação do GDF.

## Observações de conteúdo

Horários detalhados, atrações e palestrantes ainda constam como informações a divulgar. Os botões de participação direcionam a seções do site ou ao Instagram, sem criar um sistema de inscrições que não foi disponibilizado. Ao publicar, confirme a disponibilidade do perfil oficial e as demais informações operacionais.

A navegação, as abas temáticas, a animação de abertura, o efeito de parallax e os demais efeitos são implementados em JavaScript nativo e respeitam a preferência de reduzir movimentos.


### Ajustes de imagens — 23/10/2026

- Hero usa `assets/robo-future-hero.png` (imagem fornecida) centralizada, sem círculo colorido ou marca d’água de fundo.
- Seção planeta usa `assets/planeta-future-2026.png` (imagem fornecida), centralizada e com revelação vertical e degradê preto inferior.
- Textos, demais imagens, logos, navegação e links preservados.


## Revisão de 30/10/2026 — animações e performance

**Animações novas**
- Título "O futuro não é algo que você espera…": as palavras acendem conforme a rolagem.
- Planeta: sobe de baixo para cima acompanhando a rolagem.
- Assuntos (Programação): a seção fica fixa na tela e a rolagem passa os 7 temas na horizontal; no celular, faixa de botões + título e texto na mesma tela; também troca deslizando o dedo/trackpad ou pelas setas.
- Mãos: se aproximam com a rolagem e soltam uma faísca ao se tocarem.
- Tags da comunidade: grade organizada, entrada em cascata, flutuação e destaque verde que passeia.
- Título final "O amanhã começa agora.": letras normais que viram partículas só onde o mouse/dedo passa.
- Androide da seção Experiências sem moldura (anéis e brilho soltos na seção).

**Leveza**
- Imagens convertidas para WebP: a pasta `assets/` caiu de ~6,4 MB para ~0,6 MB, sem perda visível.
- Imagens que não eram usadas foram removidas do pacote.
- Fontes do Google reduzidas aos pesos realmente usados.
- Animações só rodam quando há movimento (nada fica processando com a página parada); efeito de partículas só é montado no primeiro toque/passagem do mouse.
- Todas as animações respeitam "reduzir movimento" do sistema.

**Ajustes rápidos**
- Velocidade dos assuntos: em `script.js`, procure `const HOLD` (pausa de cada tema) e `0.5 : 0.55` (rolagem por tema no celular/computador).

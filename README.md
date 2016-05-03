![](https://github.com/grama-cc/nuvela/blob/master/assets/images/share.png?raw=true)

A **[NUVELA](http://upac.com.br/nuvela)** é uma experiência audiovisual a partir do rico acervo da **[Universidade Popular de Arte e Ciência](http://upac.com.br?from=github-nuvela)**, o último grito em metanarrativa audiovisual, coletivo ritual com os melhores atores do mundo.

Inicialmente, a NUVELA exibe principalmente vídeos sobre o Hotel da Loucura. Veja com seus olhos e escute com seus ouvidos, é possível trabalhar no hospício do subúrbio do terceiro mundo seguindo os passos, explicações, conceitos e mecanismos de nossa maior artecientista e produzir cultura brasileira que cura, com Nise, afeto, cuidado, arte, saúde e resistência, do Engenho de Dentro para fora. Futuramente, iremos facilitar mecanismos para facilitar a inclusão de outras iniciativas ligadas à UPAC.

Larga a novela e vai lá ver: **[upac.com.br/nuvela](http://upac.com.br/nuvela)**

#### plataforma código livre

NUVELA é uma plataforma código livre, desenvolvida e mantida por:

##### conceito
- [Adriano Belisário][]
- [Marlus Araujo][]
- [Vitor Pordeus][]

##### design e desenvolvimento
- [Edinho Medeiros][] ([GRAMA][])
- [Harrison Mendonça][] ([GRAMA][])
- [Marlus Araujo][]

## utilização

A Nuvela funciona de forma integrada ao Youtube e ao Google Drive. Comece criando uma tabela no Google Planilhas com o seguinte cabeçalho:

    videoid	; start	; end

Nas linhas, preencha a primeira coluna com a ID do vídeo no youtube. No segundo e terceiro, a minutagem do início e do fim do trecho a ser exibido, sempre com dois cacteres no formato, tal como `00:51` ou `01:39`. Você também pode colocar campos extras para facilitar a organização dos vídeos, veja estão os organizados os vídeos atuais da Nuvela aqui: https://docs.google.com/spreadsheets/d/1vnzlSBVUoT9aARJzQPNosx3eTPhFJNKr3G_G3XDV-w8/edit?usp=sharing


Depois de inserir os vídeos, tome nota do ID da sua da planilha e insira-o como valor da variável `sheetId` no arquivo `player.js`.

Agora, basta abrir o `index.html` para assistir a sua NUVELA!

## instalação

### setup

* `npm install`


### desenvolvimento

* `npm run watch`

[Adriano Belisário]: https://twitter.com/belisards
[Marlus Araujo]: https://github.com/sulram
[Vitor Pordeus]: http://upac.com.br/#/blog/user/vitorpordeus/1

[Edinho Medeiros]: https://github.com/edinhoo
[Harrison Mendonça]: https://github.com/euharrison

[GRAMA]: http://grama.cc

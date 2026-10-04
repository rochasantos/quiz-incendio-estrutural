# Quiz de estudos

Abra `index.html` no navegador. Se o banco não carregar automaticamente, clique em **Carregar banco JSON** e selecione `questoes.json`. O banco importado dura enquanto a página estiver aberta.

Para usar no celular por um link, publique esta pasta em um serviço de hospedagem de arquivos estáticos. Ao acessar por HTTP/HTTPS, o app carrega `questoes.json` automaticamente. Esta versão não precisa de servidor de aplicação, cadastro ou banco de dados externo.

## Como montar o banco

O arquivo `questoes.json` é uma lista de questões entre colchetes `[...]`. Cada questão contém `id`, `tema`, `dificuldade`, `enunciado`, `alternativas`, `resposta_correta` e `explicacao`. O app agrupa as questões pelo texto do campo `tema`. Também aceita um objeto único para importar uma questão.

- Múltipla escolha: `alternativas` é um objeto com `a`, `b`, `c` e, opcionalmente, `d`. A `resposta_correta` é uma dessas letras minúsculas, por exemplo `"b"`.
- Verdadeiro/falso: use `"alternativas": {"a": "Verdadeiro", "b": "Falso"}` e a letra correta em `resposta_correta`. O tipo é reconhecido automaticamente, inclusive se a ordem estiver invertida.
- Use ids únicos em todo o banco, como números ou textos.
- `dificuldade` é um texto, por exemplo `"moderada"`. Ela é preservada no banco, sem aparecer na tela das perguntas nem servir como filtro nesta versão.
- Escreva uma explicação curta para cada questão; ela será exibida na revisão dos erros.
- JSON exige aspas duplas e não permite comentários ou vírgula depois do último item.

O formato anterior, com uma lista `temas`, continua aceito para bancos já criados.

As questões são sorteadas sem repetição dentro da rodada. A quantidade máxima acompanha o tema e o tipo selecionados. Cada acerto vale o mesmo peso; o score é a porcentagem de acertos arredondada para um número inteiro.

Na preparação da rodada, marque um ou vários temas, ou use **Todos os temas** para selecionar ou desmarcar a lista inteira. O sorteio reúne as questões dos temas marcados e aplica o tipo escolhido. Sem temas selecionados, o início fica desabilitado. Todos os temas começam selecionados.

## Arquivos

- `index.html`: estrutura da página.
- `style.css`: aparência e adaptação para celular.
- `app.js`: importação e validação do JSON, seleção, sorteio, perguntas e resultado.
- `questoes.json`: conteúdo editável, separado da interface.

## Evolução sugerida

1. Substituir a demonstração por questões revisadas dos seus materiais.
2. Testar no celular e publicar para acesso por link.
3. Se necessário, adicionar histórico local, revisão apenas dos erros e instalação como PWA para uso offline.

O quiz atual mantém as respostas somente na memória durante a rodada. Recarregar ou fechar a página encerra a rodada. Não há sincronização entre dispositivos.

## Leitura no celular

Na preparação, escolha **Quiz** para receber o resultado ao final ou **Estudo** para conferir cada resposta. No modo estudo, selecione uma alternativa e toque em **Confirmar resposta**. O app bloqueia a escolha, informa se houve acerto ou erro e exibe a resposta correta e a explicação em ambos os casos. Toque em **Próxima questão** para continuar; na última, **Ver resultado** mostra a pontuação. O modo estudo também funciona offline após salvar o app.

Durante a rodada, o cabeçalho e o rodapé ficam ocultos. A tela exibe o contador, o enunciado, as alternativas, o botão de avançar e um controle discreto de aparência. No celular, as questões ocupam a largura disponível, sem a moldura do cartão.

O botão **Tema escuro / Tema claro** funciona também durante a rodada, sem perder a resposta selecionada. Na primeira visita, a aparência acompanha a preferência do sistema. A escolha manual é salva neste navegador quando o armazenamento local está disponível.

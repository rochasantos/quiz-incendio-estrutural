# Quiz de estudos

App estático em HTML, CSS e JavaScript, adaptado para celular, com temas claro e escuro, seleção de vários assuntos, pontuação e revisão dos erros.

## Executar

Abra a pasta no VS Code e execute `index.html` pelo Live Server. O banco carregado automaticamente é `questoes_incendio_urbano_cbmes_100.json`. O nome do arquivo foi mantido por compatibilidade; o conteúdo pode conter mais de 100 questões.

Para editar o formato das questões, consulte `LEIA-ME.md`. O arquivo `questoes.json` contém somente exemplos.

## Publicar na Netlify

Este repositório deve conter os arquivos desta pasta na raiz, incluindo `index.html` e `netlify.toml`.

Importe o repositório do GitHub na Netlify e escolha a branch `main`. Não há comando de build. A pasta de publicação é `.` e já está definida em `netlify.toml`.

Após conectar o repositório, os novos commits enviados à branch de publicação acionam uma nova publicação na Netlify.

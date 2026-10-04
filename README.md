# Quiz de estudos

App estático em HTML, CSS e JavaScript, adaptado para celular, com temas claro e escuro, seleção de vários assuntos, pontuação e revisão dos erros.

## Executar

Abra a pasta no VS Code e execute `index.html` pelo Live Server. O banco carregado automaticamente é `questoes_incendio_urbano_cbmes_100.json`. O nome do arquivo foi mantido por compatibilidade; o conteúdo pode conter mais de 100 questões.

Para editar o formato das questões, consulte `LEIA-ME.md`. O arquivo `questoes.json` contém somente exemplos.

## Publicar na Netlify

Este repositório deve conter os arquivos desta pasta na raiz, incluindo `index.html` e `netlify.toml`.

Importe o repositório do GitHub na Netlify e escolha a branch `main`. Não há comando de build. A pasta de publicação é `.` e já está definida em `netlify.toml`.

Após conectar o repositório, os novos commits enviados à branch de publicação acionam uma nova publicação na Netlify.

## Uso offline

Acesse o link HTTPS com internet e aguarde a mensagem “Quiz e questões salvos para usar sem internet”. Depois, o mesmo endereço pode ser aberto sem conexão neste navegador. O banco padrão fica salvo junto com a interface. Arquivos JSON importados manualmente continuam disponíveis somente enquanto a página estiver aberta.

O recurso exige HTTPS (ou localhost para testes). Não funciona como service worker ao abrir um arquivo `file://`. Limpar os dados do site, usar navegação privada ou a remoção automática do armazenamento pelo navegador pode apagar a cópia offline; nesse caso, acesse novamente com internet.

Ao publicar mudanças em HTML, CSS, JavaScript ou JSON, aumente a versão de `CACHE_NAME` em `sw.js` (v1, v2, etc.). A atualização é baixada com internet e passa a ser usada depois que todas as abas antigas do quiz forem fechadas. Isso evita trocar a versão durante uma rodada.

const content = document.querySelector('#content');
const appearanceButton = document.querySelector('#aparencia');
let temaEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
try {
  const salvo = localStorage.getItem('quiz-aparencia');
  if (salvo === 'dark' || salvo === 'light') temaEscuro = salvo === 'dark';
} catch { /* Armazenamento local opcional. */ }
function aplicarAparencia() {
  document.documentElement.dataset.theme = temaEscuro ? 'dark' : 'light';
  appearanceButton.textContent = temaEscuro ? 'Tema claro' : 'Tema escuro';
  appearanceButton.setAttribute('aria-label', temaEscuro ? 'Ativar tema claro' : 'Ativar tema escuro');
  appearanceButton.setAttribute('aria-pressed', String(temaEscuro));
  document.querySelector('meta[name="theme-color"]').content = temaEscuro ? '#121a23' : '#eef3f8';
}
appearanceButton.addEventListener('click', () => {
  temaEscuro = !temaEscuro;
  aplicarAparencia();
  try { localStorage.setItem('quiz-aparencia', temaEscuro ? 'dark' : 'light'); } catch { /* Preferência apenas nesta sessão. */ }
});
aplicarAparencia();
let banco = null;
let rodada = null;
let aviso = '';
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function validar(data) {
  if (Array.isArray(data) || (data && Object.hasOwn(data, 'enunciado'))) return importarQuestoes(Array.isArray(data) ? data : [data]);
  if (!data || !Array.isArray(data.temas) || !data.temas.length) throw new Error('O JSON precisa conter uma lista "temas" não vazia.');
  const temasIds = new Set();
  for (const tema of data.temas) {
    if (typeof tema.id !== 'string' || !tema.id.trim() || temasIds.has(tema.id) || typeof tema.nome !== 'string' || !tema.nome.trim() || !Array.isArray(tema.questoes) || !tema.questoes.length) throw new Error('Cada tema precisa de id único, nome e questões.');
    temasIds.add(tema.id);
    const ids = new Set();
    for (const q of tema.questoes) {
      if (typeof q.id !== 'string' || !q.id.trim() || ids.has(q.id) || typeof q.enunciado !== 'string' || !q.enunciado.trim() || typeof q.explicacao !== 'string' || !q.explicacao.trim()) throw new Error(`Questão inválida no tema ${tema.nome}: confira id único, enunciado e explicacao.`);
      ids.add(q.id);
      if (q.tipo === 'abcd') {
        if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4 || q.alternativas.some(a => typeof a !== 'string' || !a.trim()) || !Number.isInteger(q.resposta) || q.resposta < 0 || q.resposta > 3) throw new Error(`Questão ${q.id}: use quatro alternativas e resposta de 0 a 3.`);
      } else if (q.tipo !== 'vf' || typeof q.resposta !== 'boolean') throw new Error(`Questão ${q.id}: tipo deve ser abcd ou vf; vf exige resposta true ou false.`);
    }
  }
  return data;
}

function importarQuestoes(questoes) {
  if (!questoes.length) throw new Error('Inclua pelo menos uma questão na lista.');
  const temas = new Map();
  const ids = new Set();
  const texto = value => typeof value === 'string' && value.trim().length > 0;
  for (const q of questoes) {
    if (!q || !(Number.isInteger(q.id) || texto(q.id)) || ids.has(String(q.id))) throw new Error('Cada questão precisa de um id único, numérico ou textual.');
    ids.add(String(q.id));
    if (![q.tema, q.dificuldade, q.enunciado, q.explicacao].every(texto)) throw new Error(`Questão ${q.id}: preencha tema, dificuldade, enunciado e explicacao.`);
    if (!q.alternativas || typeof q.alternativas !== 'object' || Array.isArray(q.alternativas)) throw new Error(`Questão ${q.id}: alternativas deve ser um objeto com letras a, b, c e, opcionalmente, d.`);
    const letras = Object.keys(q.alternativas).sort();
    const alternativas = letras.map(letra => q.alternativas[letra]);
    const vf = letras.join('') === 'ab' && alternativas.map(a => typeof a === 'string' ? a.trim().toLowerCase() : '').sort().join('|') === 'falso|verdadeiro';
    if ((!vf && !['abc', 'abcd'].includes(letras.join(''))) || !alternativas.every(texto)) throw new Error(`Questão ${q.id}: use a, b, c (e d opcional), ou a e b com Verdadeiro e Falso.`);
    if (!letras.includes(q.resposta_correta)) throw new Error(`Questão ${q.id}: resposta_correta deve ser uma letra existente nas alternativas.`);
    const nome = q.tema.trim();
    if (!temas.has(nome)) temas.set(nome, {id: String(temas.size + 1), nome, questoes: []});
    temas.get(nome).questoes.push({
      id: String(q.id), dificuldade: q.dificuldade, enunciado: q.enunciado,
      explicacao: q.explicacao, tipo: vf ? 'vf' : 'abcd', alternativas,
      resposta: vf ? q.alternativas[q.resposta_correta].trim().toLowerCase() === 'verdadeiro' : letras.indexOf(q.resposta_correta)
    });
  }
  return {temas: [...temas.values()]};
}

function inicio() {
  document.body.classList.remove('quiz-active');
  rodada = null;
  content.innerHTML = `<h2>Prepare sua rodada</h2><p class="notice">${escapeHtml(aviso)}</p>${banco ? '<fieldset class="themes"><legend>Temas</legend><label class="theme-choice"><input id="todos-temas" type="checkbox" checked> Todos os temas</label><div id="temas"></div></fieldset><label for="tipo">Tipo de questão</label><select id="tipo"><option value="abcd">Múltipla escolha</option><option value="vf">Verdadeiro ou falso</option></select><label for="quantidade">Quantidade de questões</label><input id="quantidade" type="number" min="1" value="1" required><p id="disponiveis" class="notice"></p><button id="iniciar">Começar quiz</button>' : '<p>Carregue um banco JSON para começar.</p>'}<label for="arquivo" class="file-button">Carregar banco JSON</label><input id="arquivo" type="file" accept=".json,application/json" hidden><p id="erro" class="error" role="alert"></p>`;
  document.querySelector('#arquivo').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;
    try { const novoBanco = validar(JSON.parse(await file.text())); banco = novoBanco; aviso = `Banco carregado: ${file.name}`; inicio(); }
    catch (error) { document.querySelector('#erro').textContent = `Não foi possível carregar: ${error.message}`; }
  });
  if (!banco) return;
  const temasContainer = document.querySelector('#temas');
  const todosTemas = document.querySelector('#todos-temas');
  temasContainer.innerHTML = banco.temas.map(t => `<label class="theme-choice"><input class="tema-checkbox" type="checkbox" value="${escapeHtml(t.id)}" checked> ${escapeHtml(t.nome)}</label>`).join('');
  const checkboxes = [...temasContainer.querySelectorAll('.tema-checkbox')];
  function atualizar() {
    const marcados = checkboxes.filter(input => input.checked).length;
    todosTemas.checked = marcados === checkboxes.length;
    todosTemas.indeterminate = marcados > 0 && marcados < checkboxes.length;
    const total = selecionadas().length;
    const input = document.querySelector('#quantidade');
    input.max = total;
    input.value = total ? Math.min(10, total) : 0;
    document.querySelector('#disponiveis').textContent = marcados ? `${total} questões disponíveis em ${marcados} ${marcados === 1 ? 'tema selecionado' : 'temas selecionados'}.` : 'Selecione pelo menos um tema.';
    document.querySelector('#iniciar').disabled = total === 0;
  }
  temasContainer.addEventListener('change', atualizar);
  todosTemas.addEventListener('change', () => {
    checkboxes.forEach(input => { input.checked = todosTemas.checked; });
    atualizar();
  });
  document.querySelector('#tipo').addEventListener('change', atualizar);
  document.querySelector('#iniciar').addEventListener('click', () => {
    const input = document.querySelector('#quantidade');
    if (!input.reportValidity()) return;
    const questoes = [...selecionadas()];
    for (let i = questoes.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [questoes[i], questoes[j]] = [questoes[j], questoes[i]]; }
    rodada = {questoes: questoes.slice(0, Number(input.value)), respostas: [], indice: 0};
    pergunta();
  });
  atualizar();
}
function selecionadas() {
  const ids = new Set([...document.querySelectorAll('.tema-checkbox:checked')].map(input => input.value));
  const tipo = document.querySelector('#tipo').value;
  return banco.temas.filter(t => ids.has(t.id)).flatMap(t => t.questoes).filter(q => q.tipo === tipo);
}
function opcoes(q) { return q.tipo === 'vf' ? ['Verdadeiro', 'Falso'] : q.alternativas; }
function valor(q, index) { return q.tipo === 'vf' ? index === 0 : index; }
function respostaTexto(q, resposta) { return q.tipo === 'vf' ? (resposta ? 'Verdadeiro' : 'Falso') : `${'ABCD'[resposta]}) ${q.alternativas[resposta]}`; }
function pergunta() {
  document.body.classList.add('quiz-active');
  const q = rodada.questoes[rodada.indice];
  content.innerHTML = `<div class="meta"><span>Questão ${rodada.indice + 1} de ${rodada.questoes.length}</span><span>${q.tipo === 'vf' ? 'Verdadeiro / falso' : 'Múltipla escolha'}</span></div><progress value="${rodada.indice}" max="${rodada.questoes.length}" aria-label="Questões respondidas"></progress><h2 tabindex="-1">${escapeHtml(q.enunciado)}</h2><div role="group" aria-label="Alternativas">${opcoes(q).map((a,i) => `<button class="option" data-index="${i}" aria-pressed="false">${q.tipo === 'abcd' ? 'ABCD'[i] + ') ' : ''}${escapeHtml(a)}</button>`).join('')}</div><button id="proxima" disabled>${rodada.indice === rodada.questoes.length - 1 ? 'Ver resultado' : 'Próxima questão'}</button>`;
  let escolhida;
  content.querySelector('.meta span:last-child').remove();
  content.querySelector('progress').remove();
  content.querySelectorAll('.option').forEach(button => button.addEventListener('click', () => {
    escolhida = valor(q, Number(button.dataset.index));
    content.querySelectorAll('.option').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelector('#proxima').disabled = false;
  }));
  document.querySelector('#proxima').addEventListener('click', () => {
    rodada.respostas.push(escolhida);
    rodada.indice++;
    if (rodada.indice < rodada.questoes.length) pergunta(); else resultado();
  });
  content.querySelector('h2').focus();
}
function resultado() {
  document.body.classList.remove('quiz-active');
  const erros = rodada.questoes.map((q,i) => ({q, resposta:rodada.respostas[i]})).filter(item => item.q.resposta !== item.resposta);
  const acertos = rodada.questoes.length - erros.length;
  content.innerHTML = `<h2 tabindex="-1">Rodada concluída!</h2><div class="score">${Math.round(acertos / rodada.questoes.length * 100)}%</div><p>${acertos} acertos em ${rodada.questoes.length} questões.</p>${erros.length ? '<button id="revisar" class="secondary" aria-expanded="false" aria-controls="revisao">Explicar respostas erradas</button><div id="revisao" hidden></div>' : '<p>Você acertou todas as questões desta rodada.</p>'}<button id="reiniciar">Escolher nova rodada</button>`;
  if (erros.length) document.querySelector('#revisar').addEventListener('click', () => {
    const revisao = document.querySelector('#revisao');
    revisao.hidden = !revisao.hidden;
    document.querySelector('#revisar').setAttribute('aria-expanded', String(!revisao.hidden));
    revisao.innerHTML = erros.map(({q,resposta}) => `<details open><summary>${escapeHtml(q.enunciado)}</summary><p>Sua resposta: ${escapeHtml(respostaTexto(q,resposta))}<br><strong>Resposta correta: ${escapeHtml(respostaTexto(q,q.resposta))}</strong></p><p>${escapeHtml(q.explicacao)}</p></details>`).join('');
  });
  document.querySelector('#reiniciar').addEventListener('click', inicio);
  content.querySelector('h2').focus();
}
async function carregarInicial() {
  try { const response = await fetch('questoes_incendio_urbano_cbmes_100.json'); if (!response.ok) throw new Error('Banco indisponível'); banco = validar(await response.json()); aviso = 'Banco demonstrativo. Substitua pelas suas questões de estudo.'; }
  catch { aviso = 'Para abrir diretamente pelo HTML, use o botão abaixo e selecione questoes_incendio_urbano_cbmes_100.json.'; }
  inicio();
}
carregarInicial();

async function prepararOffline() {
  const status = document.querySelector('#offline-status');
  if (!('serviceWorker' in navigator) || !window.isSecureContext || location.protocol === 'file:') {
    status.textContent = 'Para salvar o quiz offline, acesse pelo link HTTPS do site.';
    return;
  }
  status.textContent = 'Preparando acesso offline…';
  try {
    const registro = await navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'});
    function observar(worker) {
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant') status.textContent = 'Não foi possível salvar a atualização offline. Tente novamente com internet.';
        if (worker.state === 'installed' && registro.active) status.textContent = 'Atualização salva. Feche as abas do quiz e abra novamente para usá-la.';
      });
    }
    observar(registro.installing);
    registro.addEventListener('updatefound', () => observar(registro.installing));
    await navigator.serviceWorker.ready;
    status.textContent = registro.waiting ? 'Atualização salva. Feche as abas do quiz e abra novamente para usá-la.' : 'Quiz e questões salvos para usar sem internet.';
  } catch {
    status.textContent = 'Não foi possível preparar o acesso offline. Tente novamente com internet.';
  }
}
prepararOffline();


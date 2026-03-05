// ── COUNTDOWN ──
const endDate = new Date('2026-03-31T23:59:59');

function updateCountdown() {
  const now  = new Date();
  const diff = endDate - now;

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<span style="font-size:12px;color:var(--muted)">Encerrado</span>';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('cd-days').textContent    = String(days).padStart(2, '0');
  document.getElementById('cd-hours').textContent   = String(hours).padStart(2, '0');
  document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);


document.addEventListener('DOMContentLoaded', function () {

  // ── FAQ ACCORDION ──
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-a').style.maxHeight = '0';
        openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 32 + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ── FORMULÁRIO → N8N ──
  const N8N_WEBHOOK  = 'https://n8n.sittax.com.br/webhook/lpsittaxsitmarketing';
  const THANKYOU_URL = 'https://lp.sittax.com.br/obrigado';

  // Estilo de erro inline
  const errorStyle = '2px solid #e84040';
  const normalStyle = '';

  function setError(el, hasError) {
    if (!el) return;
    el.style.border = hasError ? errorStyle : normalStyle;
    el.style.outline = hasError ? 'none' : '';
  }

  function clearErrors() {
    ['nome','whatsapp','cnpj','estado','cliente'].forEach(function(id) {
      const el = document.getElementById(id);
      if (el) el.style.border = normalStyle;
    });
  }

  // Limpa erro ao digitar/selecionar
  ['nome','whatsapp','cnpj','estado','cliente'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function() { setError(el, false); });
    if (el) el.addEventListener('change', function() { setError(el, false); });
  });

  const submitBtn = document.querySelector('.btn-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const nomeEl     = document.getElementById('nome');
    const whatsappEl = document.getElementById('whatsapp');
    const cnpjEl     = document.getElementById('cnpj');
    const estadoEl   = document.getElementById('estado');
    const clienteEl  = document.getElementById('cliente');

    const nome     = nomeEl?.value?.trim() || '';
    const whatsapp = whatsappEl?.value?.trim() || '';
    const cnpj     = cnpjEl?.value?.trim() || '';
    const estado   = estadoEl?.value || '';
    const cliente  = clienteEl?.value || '';

    // Validação — todos obrigatórios
    let hasError = false;
    if (!nome)     { setError(nomeEl, true);     hasError = true; }
    if (!whatsapp) { setError(whatsappEl, true);  hasError = true; }
    if (!cnpj)     { setError(cnpjEl, true);      hasError = true; }
    if (!estado)   { setError(estadoEl, true);    hasError = true; }
    if (!cliente)  { setError(clienteEl, true);   hasError = true; }

    if (hasError) return;

    const originalHTML  = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Enviando...';
    submitBtn.disabled  = true;

    try {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          whatsapp,
          cnpj,
          estado,
          cliente_sittax: cliente,
          origem:     'lp_sittax_st',
          data_envio: new Date().toISOString()
        })
      });

      window.location.href = THANKYOU_URL;

    } catch (err) {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
      alert('Erro ao enviar. Tente novamente ou fale direto pelo WhatsApp.');
    }
  });

});

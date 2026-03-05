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
  const N8N_WEBHOOK = 'https://n8n.sittax.com.br/webhook/lpsittaxsitmarketing';

  const submitBtn = document.querySelector('.btn-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const nome     = document.getElementById('nome')?.value?.trim() || '';
    const whatsapp = document.getElementById('whatsapp')?.value?.trim() || '';
    const cnpj     = document.getElementById('cnpj')?.value?.trim() || '';
    const estado   = document.getElementById('estado')?.value || '';
    const cliente  = document.getElementById('cliente')?.value || '';

    if (!nome || !whatsapp) {
      alert('Por favor, preencha pelo menos nome e WhatsApp.');
      return;
    }

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

      submitBtn.innerHTML           = '✓ Recebido! Entraremos em contato.';
      submitBtn.style.background    = '#1a9e5c';
      submitBtn.style.pointerEvents = 'none';

      ['nome','whatsapp','cnpj','estado','cliente'].forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });

    } catch (err) {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled  = false;
      alert('Erro ao enviar. Tente novamente ou fale direto pelo WhatsApp.');
    }
  });

});

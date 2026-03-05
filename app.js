// Defina aqui a data de encerramento da campanha
  const endDate = new Date('2026-03-31T23:59:59');

  function updateCountdown() {
    const now = new Date();
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
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-a');
        const isOpen = item.classList.contains('open');

        // Fecha todos imediatamente
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-a').style.maxHeight = '0';
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        });

        // Abre o clicado sem delay
        if (!isOpen) {
          item.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 32 + 'px';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
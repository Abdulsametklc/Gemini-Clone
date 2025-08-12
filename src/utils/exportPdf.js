// src/utils/exportPdf.js
// Recent’ten veya aktif sohbetten gelen messages array’i -> PDF
export async function exportChatToPDF(messages, title = "Chat") {
  // Geçici bir container oluştur (ekranda görünmez).
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-10000px';
  wrap.style.top = '0';
  wrap.style.width = '800px';
  wrap.style.padding = '20px';
  wrap.style.background = getComputedStyle(document.body).backgroundColor || '#fff';
  wrap.style.fontFamily = 'Inter, system-ui, -apple-system, Roboto, Segoe UI, Arial, sans-serif';

  // Başlık
  const h = document.createElement('h2');
  h.textContent = title || 'Chat';
  h.style.margin = '0 0 16px';
  h.style.fontSize = '20px';
  h.style.fontWeight = '600';
  h.style.color = '#333';
  wrap.appendChild(h);

  // Mesaj balonları
  (messages || []).forEach(m => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.margin = '8px 0';

    const bubble = document.createElement('div');
    bubble.style.maxWidth = '70%';
    bubble.style.padding = '10px 14px';
    bubble.style.borderRadius = '18px';
    bubble.style.whiteSpace = 'pre-wrap';
    bubble.style.wordBreak = 'break-word';
    bubble.style.lineHeight = '1.45';
    bubble.style.fontSize = '14px';

    if (m.sender === 'user') {
      row.style.justifyContent = 'flex-end';
      bubble.style.background = '#4b90ff';
      bubble.style.color = '#fff';
      bubble.style.borderBottomRightRadius = '6px';
    } else {
      row.style.justifyContent = 'flex-start';
      bubble.style.background = '#e7ebf0';
      bubble.style.color = '#222';
      bubble.style.borderBottomLeftRadius = '6px';
    }

    bubble.textContent = m.text || '';
    row.appendChild(bubble);
    wrap.appendChild(row);
  });

  document.body.appendChild(wrap);

  // html2pdf (CDN) varsa onu kullan, yoksa uyar
  if (window.html2pdf) {
    const opt = {
      margin:       10,
      filename:     `${(title || 'chat').replace(/[^\w\-]+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, backgroundColor: null, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await window.html2pdf().set(opt).from(wrap).save();
  } else {
    alert('PDF motoru yüklü değil. lütfen html2pdf.js CDN’i index.html’e ekleyin.');
  }

  document.body.removeChild(wrap);
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.getElementById('motion-toggle');
const motionLabel = document.getElementById('motion-label');
let effectsPaused = false;

function motionAllowed() {
  return !motionPreference.matches && !effectsPaused && !document.hidden;
}

function syncMotionState() {
  document.documentElement.classList.toggle('effects-paused', effectsPaused);
  document.documentElement.classList.toggle('reduced-motion', motionPreference.matches);
  motionToggle.disabled = motionPreference.matches;
  motionToggle.setAttribute('aria-pressed', String(effectsPaused));
  motionLabel.textContent = motionPreference.matches
    ? 'Hiệu ứng đã tắt theo cài đặt giảm chuyển động'
    : effectsPaused ? 'Tiếp tục hiệu ứng' : 'Tạm dừng hiệu ứng';
  motionToggle.title = motionLabel.textContent;
  if (!motionAllowed()) {
    document.getAnimations?.().forEach((animation) => {
      if (animation.effect?.target?.matches('.time-block > span:first-child')) animation.cancel();
    });
  }
}

motionToggle.hidden = false;
motionToggle.addEventListener('click', () => {
  effectsPaused = !effectsPaused;
  syncMotionState();
});
motionPreference.addEventListener('change', syncMotionState);
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('page-hidden', document.hidden);
  syncMotionState();
});
syncMotionState();

if ('IntersectionObserver' in window && motionAllowed()) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  });
}

const launchDate = new Date('2026-12-31T19:00:00+07:00');
const countdownFields = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
};

function updateCountdown() {
  const remainingSeconds = Math.max(0, Math.ceil((launchDate.getTime() - Date.now()) / 1000));
  const values = {
    days: Math.floor(remainingSeconds / 86400),
    hours: Math.floor((remainingSeconds % 86400) / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: remainingSeconds % 60,
  };

  for (const [unit, value] of Object.entries(values)) {
    const field = countdownFields[unit];
    const nextValue = String(value).padStart(2, '0');
    if (field.textContent !== nextValue) {
      const wasInitialized = field.textContent !== '--';
      field.textContent = nextValue;
      if (wasInitialized && motionAllowed() && field.animate) {
        field.animate([
          { transform: 'translateY(4px)', opacity: 0.55 },
          { transform: 'translateY(0)', opacity: 1 },
        ], { duration: 240, easing: 'ease-out' });
      }
    }
  }

  if (remainingSeconds === 0) {
    document.getElementById('countdown-title').textContent = 'Đã đến cột mốc ra mắt!';
    document.querySelector('.header-status').lastChild.textContent = ' Đã đến ngày hẹn';
  }

  return remainingSeconds;
}

if (updateCountdown() > 0) {
  const countdownInterval = window.setInterval(() => {
    if (updateCountdown() === 0) window.clearInterval(countdownInterval);
  }, 1000);
}

document.querySelectorAll('.step-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    document.getElementById(button.getAttribute('aria-controls')).hidden = expanded;
    button.closest('.step').classList.toggle('is-open', !expanded);
    button.querySelector('.step-symbol').textContent = expanded ? '+' : '−';
  });
});

document.getElementById('calendar-button').addEventListener('click', () => {
  const feedback = document.getElementById('calendar-feedback');
  try {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ca Map Con City//Launch//VI',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:camapconcity-launch-20261231@camapconcity.netlify.app',
      `DTSTAMP:${timestamp}`,
      'DTSTART:20261231T120000Z',
      'DTEND:20261231T130000Z',
      'SUMMARY:Cá mập Con City — Ngày hẹn ra mắt',
      'DESCRIPTION:31/12/2026 lúc 19:00 (giờ Việt Nam UTC+7).',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Còn 30 phút đến ngày hẹn Cá mập Con City.',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');
    const calendarFile = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(calendarFile);
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'ca-map-con-city.ics';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    feedback.textContent = 'Mở tệp .ics vừa tải để thêm ngày hẹn vào lịch của bạn.';
  } catch {
    feedback.textContent = 'Chưa tải được lịch. Bạn có thể lưu thủ công: 31/12/2026, 19:00 (UTC+7).';
  }
});

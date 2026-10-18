/* Signal Lab: switchable architecture diagrams; additive and dependency-free. */
(() => {
  'use strict';
  const consoleEl = document.querySelector('.signal-console');
  if (!consoleEl) return;
  const presets = {
    telegram: {
      nodes: [
        ['↗','CLIENT','Telegram / Web','01 · INPUT'],
        ['⌘','CORE LOGIC','Python · async','02 · PROCESS'],
        ['▤','DATA LAYER','PostgreSQL · Redis','03 · STORAGE'],
        ['◇','INTEGRATIONS','Payments · API','04 · SERVICES']
      ],
      paths: ['M155 92 C220 92 218 185 288 185','M155 292 C220 292 218 205 288 205','M390 195 C445 195 444 95 505 95','M390 205 C445 205 444 292 505 292','M555 125 L555 260'],
      status: '4 modules connected', desc: 'EVENT-DRIVEN · ASYNC I/O · FAIL-SAFE', packet: 'M155 92 C220 92 218 185 288 185', center: 'M'
    },
    api: {
      nodes: [
        ['⌁','API GATEWAY','REST · OAuth2','01 · REQUEST'],
        ['⌘','SERVICE CORE','FastAPI · workers','02 · ROUTING'],
        ['▤','DATA STORE','PostgreSQL · cache','03 · PERSISTENCE'],
        ['⇄','TASK QUEUE','Redis · Celery','04 · BACKGROUND']
      ],
      paths: ['M155 92 C220 92 218 185 288 185','M155 292 C220 292 218 205 288 205','M390 195 C445 195 444 95 505 95','M390 205 C445 205 444 292 505 292','M555 125 L555 260'],
      status: '4 services orchestrated', desc: 'REST API · QUEUE WORKERS · CACHE LAYER', packet: 'M390 195 C445 195 444 95 505 95', center: 'API'
    },
    automation: {
      nodes: [
        ['⌕','COLLECTOR','Sources · webhooks','01 · INGEST'],
        ['⚙','PROCESSOR','Python · validation','02 · TRANSFORM'],
        ['▤','DATA STORE','SQL · structured data','03 · PERSIST'],
        ['↗','DELIVERY','Reports · alerts','04 · OUTPUT']
      ],
      paths: ['M155 92 C220 92 218 185 288 185','M155 292 C220 292 218 205 288 205','M390 195 C445 195 444 95 505 95','M390 205 C445 205 444 292 505 292','M555 125 L555 260'],
      status: '4 pipeline stages online', desc: 'SCHEDULED JOBS · RETRIES · OBSERVABILITY', packet: 'M390 205 C445 205 444 292 505 292', center: 'FX'
    }
  };
  const nodes = [...consoleEl.querySelectorAll('.signal-node')];
  const wirePaths = [...consoleEl.querySelectorAll('.signal-wire')];
  const buttons = [...consoleEl.querySelectorAll('.signal-blueprint')];
  const status = document.getElementById('signalStatus');
  const description = document.getElementById('signalDescription');
  const center = consoleEl.querySelector('.signal-center-core');
  const stage = consoleEl.querySelector('.signal-stage');
  let active = 'telegram';

  function selectBlueprint(key) {
    if (!presets[key] || key === active) return;
    active = key;
    const preset = presets[key];
    consoleEl.dataset.mode = key;
    buttons.forEach(button => {
      const selected = button.dataset.blueprint === key;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    nodes.forEach((node, i) => {
      const [glyph, name, sub, meta] = preset.nodes[i];
      node.querySelector('.signal-node-glyph').textContent = glyph;
      node.querySelector('.signal-node-name').textContent = name;
      node.querySelector('small').textContent = sub;
      node.querySelector('em').textContent = meta;
      node.style.animation = 'none';
      void node.offsetWidth;
      node.style.animation = '';
    });
    wirePaths.forEach((path, i) => {
      path.setAttribute('d', preset.paths[i]);
      path.style.stroke = key === 'api' ? '#81c8ff' : key === 'automation' ? '#b7ff65' : '';
    });
    const motions = [...consoleEl.querySelectorAll('animateMotion')];
    motions.forEach((motion, i) => {
      motion.setAttribute('path', i === 0 ? preset.paths[0] : preset.packet);
      if (typeof motion.beginElement === 'function') { try { motion.beginElement(); } catch (_) {} }
    });
    status.textContent = preset.status;
    description.textContent = preset.desc;
    center.textContent = preset.center;
    stage.dataset.blueprintView = key;
  }
  buttons.forEach(button => button.addEventListener('click', () => selectBlueprint(button.dataset.blueprint)));
})();

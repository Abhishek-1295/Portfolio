'use strict';

// ─────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNavbar();
  initTyping();
  initTerminal();
  initCounters();
  initSkillBars();
  initProjectTilt();
  initContactForm();
  initChatbot();
  waitForLibs(() => {
    initHeroScene();
    initGSAP();
  });
});

function waitForLibs(cb, n = 0) {
  if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') { cb(); return; }
  if (n > 40) { cb(); return; }
  setTimeout(() => waitForLibs(cb, n + 1), 100);
}

// ─────────────────────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────────────────────
function initLoader() {
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';
  const hide = () => { loader.classList.add('gone'); document.body.style.overflow = ''; };
  window.addEventListener('load', () => setTimeout(hide, 1500));
  setTimeout(hide, 4500);
}

// ─────────────────────────────────────────────────────────
// CUSTOM CURSOR
// ─────────────────────────────────────────────────────────
function initCursor() {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorFollower');
  if (!dot || !ring) return;
  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function loop() {
    rx += (mx - rx) * .13; ry += (my - ry) * .13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .proj-card, .skill-cat, .cert-card, .edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(2.5)';
      ring.style.transform = 'translate(-50%,-50%) scale(1.6)';
      ring.style.borderColor = 'var(--purple)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'var(--cyan)';
    });
  });
}

// ─────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────
function initNavbar() {
  const nav   = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  const navAs  = document.querySelectorAll('.nav-link');
  const sects  = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    let cur = '';
    sects.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }, { passive: true });
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  navAs.forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

// ─────────────────────────────────────────────────────────
// THREE.JS — NEURAL NETWORK HERO SCENE
// ─────────────────────────────────────────────────────────
function initHeroScene() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(65, W() / H(), 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W(), H());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ── Neural Network ──
  const group = new THREE.Group();
  scene.add(group);

  const NODE_COUNT = 65;
  const nodePos    = [];

  // Distribute nodes on sphere surface
  for (let i = 0; i < NODE_COUNT; i++) {
    const phi   = Math.acos(1 - 2 * (i + .5) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r     = 10 + Math.random() * 6;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    nodePos.push(new THREE.Vector3(x, y, z));
    const c = Math.random() < .65 ? 0x00f5ff : (Math.random() < .5 ? 0xb300ff : 0x00ff88);
    const geo = new THREE.SphereGeometry(.08 + Math.random() * .1, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: c });
    const m   = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    group.add(m);
  }

  // Connections
  const lineArr = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (nodePos[i].distanceTo(nodePos[j]) < 7.5) {
        lineArr.push(nodePos[i].x, nodePos[i].y, nodePos[i].z);
        lineArr.push(nodePos[j].x, nodePos[j].y, nodePos[j].z);
      }
    }
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineArr, 3));
  const lMat = new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: .13 });
  group.add(new THREE.LineSegments(lGeo, lMat));

  // Core glow sphere
  const coreGeo = new THREE.SphereGeometry(.9, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: .25 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Orbit ring
  const ringGeo = new THREE.TorusGeometry(14, .12, 16, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: .18 });
  const ring    = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  group.add(ring);

  const ring2Geo = new THREE.TorusGeometry(10, .08, 16, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xb300ff, transparent: true, opacity: .15 });
  const ring2    = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 2;
  ring2.rotation.y = Math.PI / 5;
  group.add(ring2);

  // Background particles
  const PC = 5000;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 3);
  for (let i = 0; i < PC; i++) {
    pPos[i*3]   = (Math.random() - .5) * 300;
    pPos[i*3+1] = (Math.random() - .5) * 300;
    pPos[i*3+2] = (Math.random() - .5) * 300;
    const rnd = Math.random();
    if (rnd < .5)      { pCol[i*3]=0;   pCol[i*3+1]=.96; pCol[i*3+2]=1;   }
    else if (rnd < .8) { pCol[i*3]=.7;  pCol[i*3+1]=0;   pCol[i*3+2]=1;   }
    else               { pCol[i*3]=0;   pCol[i*3+1]=1;   pCol[i*3+2]=.53; }
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ size: .28, vertexColors: true, transparent: true, opacity: .6 });
  const pts  = new THREE.Points(pGeo, pMat);
  scene.add(pts);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, .2));
  const pl1 = new THREE.PointLight(0x00f5ff, 3, 60); pl1.position.set(20, 20, 15); scene.add(pl1);
  const pl2 = new THREE.PointLight(0xb300ff, 3, 60); pl2.position.set(-20, -20, 10); scene.add(pl2);

  camera.position.set(0, 0, 28);

  let tX = 0, tY = 0;
  document.addEventListener('mousemove', e => {
    tX = (e.clientX / W() - .5) * .8;
    tY = (e.clientY / H() - .5) * .8;
  });

  const clk = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clk.getElapsedTime();
    group.rotation.y  = t * .08;
    group.rotation.x  = Math.sin(t * .04) * .15;
    ring.rotation.z   = t * .06;
    ring2.rotation.z  = -t * .04;
    pts.rotation.y    = t * .02;
    pts.rotation.x    = t * .005;
    const s = 1 + Math.sin(t * 2.5) * .15;
    core.scale.set(s, s, s);
    pl1.intensity = 2.5 + Math.sin(t * 2) * .8;
    pl2.intensity = 2.5 + Math.cos(t * 1.6) * .8;
    camera.position.x += (tX * 4 - camera.position.x) * .022;
    camera.position.y += (-tY * 4 - camera.position.y) * .022;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });
}

// ─────────────────────────────────────────────────────────
// TERMINAL ANIMATION
// ─────────────────────────────────────────────────────────
function initTerminal() {
  const body = document.getElementById('termBody');
  if (!body) return;

  const lines = [
    { t: 300,   type: 'cmd',   prefix: '$ ',    text: 'python dev_profile.py',                cls: '' },
    { t: 1200,  type: 'out',                     text: '🔄  Loading profile...',              cls: '' },
    { t: 2200,  type: 'cmd',   prefix: '>>> ',   text: 'dev.name',                            cls: '' },
    { t: 3000,  type: 'out',                     text: '"Abhishek R"',                         cls: 'cyan' },
    { t: 3800,  type: 'cmd',   prefix: '>>> ',   text: 'dev.title',                           cls: '' },
    { t: 4600,  type: 'out',                     text: '"Aspiring Data Scientist | ML | Full Stack"', cls: 'cyan' },
    { t: 5500,  type: 'cmd',   prefix: '>>> ',   text: 'dev.university',                      cls: '' },
    { t: 6200,  type: 'out',                     text: '"Amrita Vishwa Vidyapeetham, Mysuru"', cls: 'cyan' },
    { t: 7200,  type: 'cmd',   prefix: '>>> ',   text: 'dev.cgpa',                            cls: '' },
    { t: 7900,  type: 'out',                     text: '8.21 / 10.0  ⭐',                     cls: 'gold' },
    { t: 8900,  type: 'cmd',   prefix: '>>> ',   text: 'dev.skills[:3]',                      cls: '' },
    { t: 9600,  type: 'out',                     text: "['Python', 'Machine Learning', 'React']", cls: 'cyan' },
    { t: 10500, type: 'cmd',   prefix: '>>> ',   text: 'dev.status',                          cls: '' },
    { t: 11200, type: 'out',                     text: '"Open to Internships ✅"',              cls: 'green' },
    { t: 12000, type: 'cmd',   prefix: '>>> ',   text: 'dev.location',                        cls: '' },
    { t: 12700, type: 'out',                     text: '"Mysuru, India 📍"',                   cls: 'cyan' },
  ];

  // Create cursor element
  const cursorEl = document.createElement('span');
  cursorEl.className = 'tl-cursor';
  body.appendChild(cursorEl);

  lines.forEach(line => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'tl';
      if (line.type === 'cmd') {
        div.innerHTML = `<span class="tl-prompt">${line.prefix}</span><span class="tl-cmd">${line.text}</span>`;
      } else {
        div.innerHTML = `<span class="tl-out ${line.cls || ''}">${line.text}</span>`;
      }
      body.insertBefore(div, cursorEl);
      body.scrollTop = body.scrollHeight;
    }, line.t);
  });
}

// ─────────────────────────────────────────────────────────
// GSAP SCROLL ANIMATIONS
// ─────────────────────────────────────────────────────────
function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.section-header').forEach(el =>
    gsap.from(el, { opacity:0, y:45, duration:.8, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 88%' } }));

  gsap.from('#aboutCard', { opacity:0, x:-60, duration:.9, ease:'power3.out',
    scrollTrigger:{ trigger:'.about-grid', start:'top 80%' } });
  gsap.from('#aboutText', { opacity:0, x:60, duration:.9, ease:'power3.out',
    scrollTrigger:{ trigger:'.about-grid', start:'top 80%' } });

  document.querySelectorAll('.skill-cat').forEach((el, i) =>
    gsap.from(el, { opacity:0, y:40, duration:.65, delay:i*.12, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 90%' } }));

  gsap.from('.soft-skills-row', { opacity:0, y:30, duration:.7, ease:'power3.out',
    scrollTrigger:{ trigger:'.soft-skills-row', start:'top 88%' } });

  document.querySelectorAll('.proj-card').forEach((el, i) =>
    gsap.from(el, { opacity:0, y:55, duration:.65, delay:i*.12, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 92%' } }));

  gsap.from('#eduCard', { opacity:0, x:-50, duration:.8, ease:'power3.out',
    scrollTrigger:{ trigger:'#eduCard', start:'top 85%' } });

  document.querySelectorAll('.cert-card').forEach((el, i) =>
    gsap.from(el, { opacity:0, y:35, duration:.65, delay:i*.15, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 90%' } }));

  gsap.from('#contactInfo', { opacity:0, x:-50, duration:.8, ease:'power3.out',
    scrollTrigger:{ trigger:'.contact-grid', start:'top 82%' } });
  gsap.from('.contact-form', { opacity:0, x:50, duration:.8, ease:'power3.out',
    scrollTrigger:{ trigger:'.contact-grid', start:'top 82%' } });
}

// ─────────────────────────────────────────────────────────
// TYPING ANIMATION
// ─────────────────────────────────────────────────────────
function initTyping() {
  const el    = document.getElementById('typingText');
  if (!el) return;
  const words = [
    'Aspiring Data Scientist',
    'Python & ML Developer',
    'Full Stack Developer',
    'BCA Data Science Student',
    'Problem Solver',
    'Open to Internships 🚀',
  ];
  let wi = 0, ci = 0, del = false;
  (function loop() {
    const w = words[wi];
    el.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
    if (!del && ci === w.length)      { del = true; setTimeout(loop, 2400); return; }
    if  (del && ci === 0)             { del = false; wi = (wi+1) % words.length; setTimeout(loop, 400); return; }
    setTimeout(loop, del ? 45 : 90);
  })();
}

// ─────────────────────────────────────────────────────────
// COUNTERS
// ─────────────────────────────────────────────────────────
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = parseInt(el.dataset.target), dur = 1800;
      let cur = 0;
      (function tick() {
        cur = Math.min(cur + end / (dur / 16), end);
        el.textContent = Math.floor(cur);
        if (cur < end) requestAnimationFrame(tick);
        else el.textContent = end;
      })();
      obs.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('.stat-number').forEach(c => obs.observe(c));
}

// ─────────────────────────────────────────────────────────
// SKILL BARS
// ─────────────────────────────────────────────────────────
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => { e.target.style.width = e.target.dataset.w + '%'; }, 250);
      obs.unobserve(e.target);
    });
  }, { threshold: .1 });
  document.querySelectorAll('.skill-fill').forEach(b => obs.observe(b));
}

// ─────────────────────────────────────────────────────────
// PROJECT CARD 3D TILT
// ─────────────────────────────────────────────────────────
function initProjectTilt() {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-8px) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ─────────────────────────────────────────────────────────
// CONTACT FORM — EmailJS Integration
// ─────────────────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  const msg  = document.getElementById('formMsg');
  const btn  = document.getElementById('cfSubmit');
  if (!form) return;

  // ── EmailJS Credentials ──────────────────────────────
  // STEP 1: Sign up free at https://emailjs.com
  // STEP 2: Add Gmail → get your Service ID
  // STEP 3: Create Template → get Template ID
  //         Template variables: {{from_name}}, {{from_email}}, {{subject}}, {{message}}
  // STEP 4: Copy your Public Key from Account > General
  // ─────────────────────────────────────────────────────
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz789'
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'AbCdEfGhIjKlMnOp'

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('cfName').value.trim();
    const email   = document.getElementById('cfEmail').value.trim();
    const subject = document.getElementById('cfSubject').value.trim();
    const message = document.getElementById('cfMessage').value.trim();

    if (!name || !email || !subject || !message) { showMsg('Please fill in all fields.', 'err'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMsg('Please enter a valid email.', 'err'); return; }

    const lbl = btn.querySelector('.btn-label');
    lbl.textContent = 'Sending…'; btn.disabled = true;

    try {
      if (EMAILJS_SERVICE_ID.startsWith('YOUR_')) {
        // ── EmailJS not configured yet — use mailto fallback ──
        const mailto = `mailto:abhishek129529@gmail.com`
          + `?subject=${encodeURIComponent(subject)}`
          + `&body=${encodeURIComponent(`Hi Abhishek,\n\nFrom: ${name}\nEmail: ${email}\n\n${message}`)}`;
        window.open(mailto);
        showMsg('📧 Opening your email client... Thanks for reaching out!', 'ok');
        form.reset();
      } else {
        // ── EmailJS configured — send directly ──
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          { from_name: name, from_email: email, subject: subject, message: message },
          EMAILJS_PUBLIC_KEY
        );
        showMsg('🚀 Message sent! Abhishek will get back to you soon.', 'ok');
        form.reset();
      }
    } catch (err) {
      console.error('EmailJS error:', err);
      showMsg('❌ Could not send. Please email: abhishek129529@gmail.com', 'err');
    } finally {
      lbl.textContent = 'Send Message'; btn.disabled = false;
    }
  });

  function showMsg(text, cls) {
    msg.textContent = text; msg.className = 'form-msg ' + cls;
    setTimeout(() => { msg.className = 'form-msg'; }, 5500);
  }
}

// ─────────────────────────────────────────────────────────
// CHATBOT — ARIA (knows Abhishek's real info)
// ─────────────────────────────────────────────────────────
function initChatbot() {
  const toggle  = document.getElementById('botToggle');
  const chatWin = document.getElementById('botWindow');
  const closeB  = document.getElementById('botClose');
  const input   = document.getElementById('botInput');
  const send    = document.getElementById('botSend');
  const msgs    = document.getElementById('botMsgs');
  if (!toggle) return;

  let open = false;
  toggle.addEventListener('click', () => { open = !open; chatWin.classList.toggle('open', open); if (open) input.focus(); });
  closeB.addEventListener('click', () => { open = false; chatWin.classList.remove('open'); });
  send.addEventListener('click', sendMsg);
  input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });

  function sendMsg() {
    const txt = input.value.trim(); if (!txt) return;
    addMsg(txt, 'user'); input.value = '';
    const typ = addTyping();
    setTimeout(() => { typ.remove(); addMsg(getReply(txt), 'bot'); }, 900 + Math.random() * 600);
  }
  function addMsg(text, who) {
    const w = document.createElement('div');
    w.className = `bot-msg-wrap ${who}`;
    w.innerHTML = `<div class="bot-bubble">${text}</div>`;
    msgs.appendChild(w); msgs.scrollTop = msgs.scrollHeight; return w;
  }
  function addTyping() {
    const w = document.createElement('div');
    w.className = 'bot-msg-wrap bot';
    w.innerHTML = '<div class="bot-bubble"><div class="typing-dots"><div class="tdot-anim"></div><div class="tdot-anim"></div><div class="tdot-anim"></div></div></div>';
    msgs.appendChild(w); msgs.scrollTop = msgs.scrollHeight; return w;
  }

  const KB = [
    { rx: /hi|hello|hey|sup|greet/i,
      ans: "Hey! 👋 I'm <strong>ARIA</strong> — Abhishek's portfolio AI. Ask me about his skills, projects, education, or contact info!" },
    { rx: /name|who/i,
      ans: "His name is <strong>Abhishek R</strong> — an aspiring Data Scientist and Full Stack Developer from Mysuru, India. 🙌" },
    { rx: /skill|know|tech|language|stack|code|program/i,
      ans: "Abhishek is skilled in <strong>Python, Machine Learning, Scikit-learn, Pandas, NumPy</strong> for data science, and <strong>React, Node.js, Express, MongoDB</strong> for full stack web dev. Also knows C, C++, Java, SQL, Git, and Linux! 💪" },
    { rx: /project|built|made|work/i,
      ans: "Abhishek built two awesome projects: <br>🏠 <strong>House Price Predictor</strong> — ML model using Random Forest (Apr 2026)<br>🏨 <strong>Room Booking Web App</strong> — Full stack React + Node.js + MongoDB (Jan 2026). Check the Projects section! 🚀" },
    { rx: /house|price|predict|ml|machine|forest|random/i,
      ans: "The <strong>House Price Predictor</strong> uses Random Forest Regressor to predict house prices accurately. Abhishek did data preprocessing, feature selection, and model evaluation using RMSE and R² metrics. Built with Python, Scikit-learn, Pandas, and NumPy on Google Colab! 🌲" },
    { rx: /room|booking|web|react|node|express|mongo/i,
      ans: "The <strong>Room Booking Web App</strong> is a full-stack application with a React frontend, Node.js/Express backend, and MongoDB database. It features CRUD operations, real-time availability updates, and a RESTful API architecture! 🏨" },
    { rx: /education|study|university|college|degree|bca|amrita/i,
      ans: "Abhishek is studying <strong>BCA — Specialization in Data Science</strong> at <strong>Amrita Vishwa Vidyapeetham, Mysuru</strong> (2024–2027). His CGPA is an impressive <strong>8.21 / 10.0</strong> ⭐. Relevant courses include Data Mining, ML, AI, Data Governance, and Full Stack Web Dev." },
    { rx: /cgpa|gpa|grade|marks|score/i,
      ans: "Abhishek's current CGPA is <strong>8.21 / 10.0</strong> ⭐ at Amrita Vishwa Vidyapeetham. That's a great score!" },
    { rx: /certif|cisco|credly|badge/i,
      ans: "Abhishek has 2 certifications from <strong>Cisco Networking Academy</strong>:<br>📜 Introduction to Data Science (Oct 2025)<br>📜 CSS Essentials (Nov 2025)<br>Both are verified on Credly! 🏅" },
    { rx: /contact|email|phone|reach|hire|message|connect/i,
      ans: "Reach Abhishek at:<br>📧 <strong>abhishek129529@gmail.com</strong><br>📱 <strong>+91 8123118480</strong><br>📍 <strong>Mysuru, India</strong><br>Or use the Contact form on this page!" },
    { rx: /internship|job|opportunit|hiring|available|looking/i,
      ans: "Yes! Abhishek is actively looking for <strong>internship opportunities</strong> in Data Science, Machine Learning, or Full Stack Web Development. He's eager to learn and contribute in a professional setting! 🟢" },
    { rx: /python|data.?science|pandas|numpy|sklearn/i,
      ans: "Python is Abhishek's strongest language! He uses it for data analysis with Pandas & NumPy, and machine learning with Scikit-learn. He's built an ML project (House Price Predictor) using these tools. 🐍" },
    { rx: /soft.?skill|communication|leadership|problem/i,
      ans: "Abhishek's soft skills include <strong>Communication, Leadership, Problem Solving, and Critical Thinking</strong>. He speaks English and Hindi fluently!" },
    { rx: /thank|thanks|awesome|great|cool|nice|amazing/i,
      ans: "Thank you! 😊 Anything else you'd like to know about Abhishek?" },
    { rx: /location|where|mysuru|india|city/i,
      ans: "Abhishek is based in <strong>Mysuru, Karnataka, India</strong>. He's currently studying there and open to remote opportunities as well! 📍" },
    { rx: /help|what can|ask|tell me/i,
      ans: "I can tell you about Abhishek's:<br>• Skills & Technologies<br>• Projects (House Price Predictor, Room Booking App)<br>• Education (BCA Data Science, CGPA 8.21)<br>• Certifications (Cisco)<br>• Contact Information<br>• Internship availability<br>Just ask! 🤖" },
  ];

  function getReply(input_) {
    for (const e of KB) { if (e.rx.test(input_)) return e.ans; }
    return "Great question! For that specific detail, please reach out to Abhishek directly at <strong>abhishek129529@gmail.com</strong> or use the contact form. He'll reply quickly! 😊";
  }
}

// ─────────────────────────────────────────────────────────
// SMOOTH SCROLL
// ─────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

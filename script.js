/* ==========================================================
   GOTHIC BIRTHDAY - HELLFIRE DEMONIC JS
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* Elementos principales */
    const ritualScreen   = document.getElementById('ritualScreen');
    const ritualStartBtn = document.getElementById('ritualStartBtn');
    const mainContent    = document.getElementById('mainContent');
    const audio          = document.getElementById('bgAudio');
    const audioToggle    = document.getElementById('audioToggle');
    const volumeSlider   = document.getElementById('volumeSlider');
    const audioWaves     = document.getElementById('audioWaves');
    const canvas         = document.getElementById('hellfire');
    const ctx            = canvas ? canvas.getContext('2d') : null;

    let isAudioPlaying   = false;

    /* ── 1. CANVAS HELLFIRE SIMULATION ──────────────────── */
    if (canvas && ctx) {
        initHellfire();
    }

    function initHellfire() {
        const resizeCanvas = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle system for fire
        const PARTICLE_COUNT = 120;
        const particles = [];

        class FireParticle {
            reset() {
                this.x    = Math.random() * canvas.width;
                this.y    = canvas.height + Math.random() * 100;
                this.size = Math.random() * 18 + 6;
                this.speedY = -(Math.random() * 2.5 + 1.0);
                this.speedX = (Math.random() - 0.5) * 1.2;
                this.life   = 1.0;
                this.decay  = Math.random() * 0.012 + 0.006;
                // Fire color: yellow → orange → red → transparent
                const t = Math.random();
                if (t < 0.3) {
                    this.color = `rgba(255, ${Math.floor(180 + Math.random() * 75)}, 0,`;
                } else if (t < 0.65) {
                    this.color = `rgba(255, ${Math.floor(60 + Math.random() * 80)}, 0,`;
                } else {
                    this.color = `rgba(${Math.floor(180 + Math.random() * 75)}, 0, 0,`;
                }
            }
            constructor() { this.reset(); this.y = Math.random() * canvas.height; }

            update() {
                this.y    += this.speedY;
                this.x    += this.speedX + Math.sin(Date.now() * 0.001 + this.x) * 0.4;
                this.size *= 0.993;
                this.life -= this.decay;
                if (this.life <= 0 || this.size < 1) this.reset();
            }

            draw() {
                ctx.save();
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0,   `${this.color}${(this.life * 0.85).toFixed(2)})`);
                gradient.addColorStop(0.5, `${this.color}${(this.life * 0.4).toFixed(2)})`);
                gradient.addColorStop(1,   `${this.color}0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new FireParticle());
        }

        function drawHellfire() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw base glow at bottom
            const baseGlow = ctx.createLinearGradient(0, canvas.height * 0.65, 0, canvas.height);
            baseGlow.addColorStop(0,   'rgba(0,0,0,0)');
            baseGlow.addColorStop(0.5, 'rgba(80,10,0,0.25)');
            baseGlow.addColorStop(1,   'rgba(200,40,0,0.5)');
            ctx.fillStyle = baseGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(drawHellfire);
        }
        drawHellfire();
    }

    /* ── 2. BOTÓN RITUAL ────────────────────────────────── */
    ritualStartBtn.addEventListener('click', startRitual);

    function startRitual() {
        ritualStartBtn.disabled = true;
        ritualStartBtn.querySelector('.btn-text').textContent = '⛧  Las Puertas se Abren...  ⛧';

        // Intentar reproducir audio
        console.log("Reproduciendo:", audio.currentSrc || audio.src);
        audio.volume = parseFloat(volumeSlider.value);
        audio.play()
            .then(() => { isAudioPlaying = true; setAudioUIPlaying(true); })
            .catch(() => {});

        // Fade out ritual screen
        setTimeout(() => ritualScreen.classList.add('fade-out'), 700);

        // Mostrar contenido principal
        setTimeout(() => {
            ritualScreen.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '0';
            mainContent.style.transition = 'opacity 1.8s ease';
            requestAnimationFrame(() => { mainContent.style.opacity = '1'; });
            startParticles();
        }, 1500);
    }

    /* ── 3. CONTROL AUDIO ───────────────────────────────── */
    audioToggle.addEventListener('click', () => {
        if (isAudioPlaying) {
            audio.pause(); isAudioPlaying = false; setAudioUIPlaying(false);
        } else {
            audio.play()
                .then(() => { isAudioPlaying = true; setAudioUIPlaying(true); })
                .catch(() => {});
        }
    });

    volumeSlider.addEventListener('input', () => { audio.volume = parseFloat(volumeSlider.value); });

    function setAudioUIPlaying(playing) {
        if (playing) {
            audioToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
            audioWaves.classList.remove('paused');
        } else {
            audioToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
            audioWaves.classList.add('paused');
        }
    }

    /* ── 4. PARTÍCULAS FLOTANTES ────────────────────────── */
    const SYMBOLS = ['💀', '🥀', '⛧', '🔥', '🖤', '⚰', '☠', '🌑'];

    function startParticles() {
        const container = document.getElementById('particles');
        setInterval(() => {
            const p = document.createElement('span');
            p.className = 'particle';
            p.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            p.style.left = Math.random() * 100 + 'vw';
            const dur = Math.random() * 10 + 8;
            p.style.animationDuration = dur + 's';
            p.style.fontSize = (Math.random() * 0.9 + 0.5) + 'rem';
            container.appendChild(p);
            setTimeout(() => p.remove(), dur * 1000);
        }, 1000);
    }

    /* ── 5. CARRUSEL DE CITAS ───────────────────────────── */
    const quotes  = document.querySelectorAll('.gothic-quote');
    const qdots   = document.querySelectorAll('.qdot');
    let currentQ  = 0;

    function showQuote(i) {
        quotes.forEach(q => q.classList.remove('active'));
        qdots.forEach(d => d.classList.remove('active'));
        quotes[i].classList.add('active');
        qdots[i].classList.add('active');
        currentQ = i;
    }

    setInterval(() => showQuote((currentQ + 1) % quotes.length), 5000);
    qdots.forEach((d, i) => d.addEventListener('click', () => showQuote(i)));

    /* ── 6. RASTRO DE LAVA EN EL CURSOR ────────────────── */
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.85) {
            const drop = document.createElement('div');
            drop.className = 'lava-drop';
            const s = Math.random() * 8 + 4;
            const h = Math.random() * 18 + 8;
            drop.style.cssText = `
                left: ${e.clientX + (Math.random() * 16 - 8)}px;
                top:  ${e.clientY}px;
                width: ${s}px;
                height: ${h}px;
                animation-duration: ${Math.random() * 0.8 + 0.5}s;
            `;
            document.body.appendChild(drop);
            setTimeout(() => drop.remove(), 1200);
        }
    });

    /* ── 7. CORAZÓN: ACELERA AL HOVER ──────────────────── */
    const heartSVG = document.querySelector('.gothic-heart-svg');
    if (heartSVG) {
        heartSVG.addEventListener('mouseenter', () => heartSVG.style.animationDuration = '0.4s');
        heartSVG.addEventListener('mouseleave', () => heartSVG.style.animationDuration = '1.1s');
    }

    /* ── 8. MODAL DEL PORTAL ────────────────────────────── */
    const portalModal    = document.getElementById('portalModal');
    const openPortalBtn  = document.getElementById('openPortalBtn');
    const modalClose     = document.getElementById('modalClose');
    const modalBackdrop  = portalModal ? portalModal.querySelector('.modal-backdrop') : null;
    const modalCanvas    = document.getElementById('modalParticles');

    // Sistema de partículas para el modal
    class ModalParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.animationId = null;
        }
        init() {
            this.resize();
            this.particles = [];
            for (let i = 0; i < 40; i++) {
                this.addParticle();
            }
        }
        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
        addParticle() {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                size: Math.random() * 3 + 1,
                speedY: Math.random() * 2 + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                color: `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, 0, ${Math.random() * 0.6 + 0.2})`,
                life: Math.random() * 0.6 + 0.4
            });
        }
        draw() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.particles.forEach((p, i) => {
                p.y -= p.speedY;
                p.x += p.speedX;
                p.life -= 0.005;
                if (p.life <= 0 || p.y < -20) {
                    this.particles[i] = {
                        x: Math.random() * this.canvas.width,
                        y: this.canvas.height + 10,
                        size: Math.random() * 3 + 1,
                        speedY: Math.random() * 2 + 1,
                        speedX: (Math.random() - 0.5) * 1.5,
                        color: `rgba(255, ${Math.floor(Math.random() * 100 + 50)}, 0, ${Math.random() * 0.6 + 0.2})`,
                        life: Math.random() * 0.6 + 0.4
                    };
                }
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.fill();
            });
            this.animationId = requestAnimationFrame(() => this.draw());
        }
        stop() {
            cancelAnimationFrame(this.animationId);
        }
    }

    const modalPS = modalCanvas ? new ModalParticleSystem(modalCanvas) : null;

    function openModal() {
        if (!portalModal) return;
        portalModal.classList.add('open');
        portalModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        if (modalPS) {
            modalPS.init();
            modalPS.draw();
        }
    }

    function closeModal() {
        if (!portalModal) return;
        portalModal.classList.remove('open');
        portalModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        if (modalPS) modalPS.stop();
    }

    if (openPortalBtn)  openPortalBtn.addEventListener('click', openModal);
    if (openPortalBtn)  openPortalBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(); });
    if (modalClose)     modalClose.addEventListener('click', closeModal);
    if (modalBackdrop)  modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ── 9. GALERÍA SECRETA ────────────────────────────── */
    const unlockBtn    = document.getElementById('unlockBtn');
    const galleryPass  = document.getElementById('galleryPass');
    const galleryLock  = document.getElementById('galleryLock');
    const secretGallery = document.getElementById('secretGallery');
    const errorMsg     = document.getElementById('errorMsg');

    if (unlockBtn) {
        unlockBtn.addEventListener('click', validadClave);
    }

    if (galleryPass) {
        galleryPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') validadClave();
        });
    }

    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg   = document.getElementById('lightboxImg');
    const closeLightbox = document.getElementById('closeLightbox');
    const lightboxBack  = document.querySelector('.lightbox-backdrop');

    function openLightbox(src) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Bloquear scroll
    }

    function closeLightboxModal() {
        if (!lightboxModal) return;
        lightboxModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // Cerrar con botón, fondo o ESC
    if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxModal);
    if (lightboxBack) lightboxBack.addEventListener('click', closeLightboxModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightboxModal();
    });

    function loadGallery() {
        if (!photoGrid) return;
        const photos = [
            { src: 'melany/amor.jpg', alt: 'Recuerdo 1' },
            { src: 'melany/amor1.jpg', alt: 'Recuerdo 2' },
            { src: 'melany/amor2.jpg', alt: 'Recuerdo 3' },
            { src: 'melany/amor3.jpg', alt: 'Recuerdo 4' }
        ];

        photoGrid.innerHTML = ''; // Limpiar por si acaso
        photos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.style.setProperty('--bg-img', `url(${p.src})`);
            card.innerHTML = `
                <img src="${p.src}" alt="${p.alt}">
                <div class="photo-overlay"></div>
            `;
            
            // Evento para abrir lightbox
            card.addEventListener('click', () => openLightbox(p.src));
            
            photoGrid.appendChild(card);
        });
    }

    function validadClave() {
        const input = galleryPass.value;
        const correctPass = "13645454";

        if (input === correctPass) {
            // Cargar fotos dinámicamente antes de mostrar
            loadGallery();

            // Éxito: Revelar galería
            galleryLock.style.opacity = '0';
            galleryLock.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                galleryLock.classList.add('hidden');
                secretGallery.classList.remove('hidden');
                
                // Scroll suave a la galería
                secretGallery.scrollIntoView({ behavior: 'smooth' });
            }, 600);
        } else {
            // Error: Feedback visual
            errorMsg.classList.remove('hidden');
            galleryPass.style.borderColor = "#ff0000";
            galleryPass.style.boxShadow = "0 0 15px #ff0000";
            
            // Re-ocultar error después de un momento
            setTimeout(() => {
                galleryPass.style.borderColor = "";
                galleryPass.style.boxShadow = "";
            }, 1000);
        }
    }
});

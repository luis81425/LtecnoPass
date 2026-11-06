/* =========================================================
   ▶ VIDEOS DEL CANAL (se cargan solos)
   El carrusel muestra los videos que ya tienes subidos a tu canal:
   los lee del feed público de YouTube, así que cuando subas uno
   nuevo aparece sin tocar el código.
   - CANAL_ID   : ID del canal (ya es el de @ltecnopaso).
   - MAX_VIDEOS : cuántos videos muestra (el feed público da ~10-15).
   - YT_API_KEY : (opcional) clave de YouTube Data API v3. Con ella
                  puede mostrar hasta 50 y es la vía más estable.
   - VIDEOS     : ya NO es la lista del carrusel. Es el respaldo si
                  YouTube no responde, y sirve para ponerle título o
                  etiqueta propia (o  wide: true  si es horizontal)
                  a un video en particular.
========================================================= */
const CANAL_YOUTUBE = "https://www.youtube.com/@ltecnopaso";
const CANAL_ID = "UCdEbfv2sNIbTds4wetFuDaQ";
const MAX_VIDEOS = 15;
const YT_API_KEY = "";
const VIDEOS = [
    { id: "k69djf3ZjOI", title: "Ford Raptor",                tag: "Camionetas" },
    { id: "nEGcCaZGPyI", title: "Ford F-150",                 tag: "Camionetas" },
    { id: "LUr2DN3SNlE", title: "Atajo de Windows: Win + L",  tag: "Tips de PC" },
    { id: "ggzBJXHM1-8", title: "Tip de Microsoft Word",      tag: "Tips de PC" },
];

document.addEventListener("DOMContentLoaded", () => {

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // La intro "Arranque" pasa a llamarse #intro para el resto del script
    const introNode = document.getElementById("intro-arranque");
    if (introNode) introNode.id = "intro";
    // La intro siempre empieza arriba (evita que se vea sobre la sección donde estabas al recargar)
    if (!reduceMotion && document.getElementById("intro")) {
        window.scrollTo(0, 0);
        window.addEventListener("load", () => window.scrollTo(0, 0), { once: true });
    }

    // 1. Scroll Reveal
    const playIntro = !reduceMotion && !!document.getElementById("intro");
    const reveals = [...document.querySelectorAll(".reveal")].filter(el => !(playIntro && el.closest(".hero")));
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(el => revealObserver.observe(el));


    // 0. Animación de entrada
    const introEl = document.getElementById("intro");
    if (introEl && playIntro) {
        introEl.classList.add("live");
        const introNum = document.getElementById("introNum");
        const introLabel = document.getElementById("introLabel");
        if (introNum) {
            const t0 = performance.now();
            const countUp = now => {
                const p = Math.min(Math.max((now - t0 - 350) / 2900, 0), 1);
                introNum.textContent = Math.round(100 * (1 - Math.pow(1 - p, 2.4)));
                if (p < 1) requestAnimationFrame(countUp);
                else if (introLabel) introLabel.textContent = "LISTO";
            };
            requestAnimationFrame(countUp);
        }
        document.documentElement.classList.add("intro-on");
        let finished = false;
        // data-ms="0" = la intro espera hasta que la persona toque "Entrar"
        const ms = introEl.dataset.ms !== undefined ? +introEl.dataset.ms : 3100;
        const autoClose = ms > 0 ? setTimeout(() => finish(), ms) : null;
        function finish() {
            if (finished) return;
            finished = true;
            if (autoClose) clearTimeout(autoClose);
            introEl.classList.add("leave");
            setTimeout(() => {
                introEl.classList.add("gone");
                document.documentElement.classList.remove("intro-on");
                document.documentElement.classList.add("hero-in");
                document.querySelectorAll(".hero .reveal").forEach(el => revealObserver.observe(el));
            }, 950);
        }
        const enterBtn = document.getElementById("introEnter");
        if (enterBtn) {
            enterBtn.addEventListener("click", finish);
            const replayBtn = introEl.querySelector(".arr-replay");
            if (replayBtn) replayBtn.addEventListener("click", () => location.reload());
            setTimeout(() => { if (!finished) enterBtn.focus({ preventScroll: true }); }, 4300);
        }
        const skipBtn = introEl.querySelector(".intro-skip");
        if (skipBtn) skipBtn.addEventListener("click", e => { e.stopPropagation(); finish(); });

        // Tocar el medidor = acelerar (aguja y faros reaccionan)
        const gauge = introEl.querySelector(".arr-gauge");
        if (gauge) {
            let revTimer;
            gauge.addEventListener("click", () => {
                gauge.classList.remove("rev"); introEl.classList.remove("rev");
                void gauge.offsetWidth;
                gauge.classList.add("rev"); introEl.classList.add("rev");
                clearTimeout(revTimer);
                revTimer = setTimeout(() => { gauge.classList.remove("rev"); introEl.classList.remove("rev"); }, 1000);
            });
        }
        window.addEventListener("keydown", e => { if (["Escape", "Enter", " "].includes(e.key)) finish(); });
    } else if (introEl) {
        introEl.remove();
    }

    // 3. Navbar: estado al hacer scroll + barra de progreso
    const navbar = document.getElementById("navbar");
    const progress = document.querySelector(".scroll-progress");
    const onScroll = () => {
        const scrollTop = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        navbar.classList.toggle("scrolled", scrollTop > 20);
        progress.style.width = height > 0 ? `${(scrollTop / height) * 100}%` : "0";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 4. Menú móvil
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    const closeMenu = () => {
        toggle.classList.remove("open");
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", () => {
        const open = toggle.classList.toggle("open");
        links.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    // 5. Enlace activo según la sección visible
    const sections = document.querySelectorAll("header[id], section[id], footer[id]");
    const navAnchors = links.querySelectorAll("a:not(.nav-cta)");
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAnchors.forEach(a =>
                    a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
                );
            }
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => sectionObserver.observe(s));

    // 6. Texto escribiéndose en el hero
    const typedEl = document.getElementById("typed");
    if (typedEl) {
        const words = JSON.parse(typedEl.dataset.words);
        if (reduceMotion) {
            typedEl.textContent = words[0];
        } else {
            let w = 0, c = 0, deleting = false;
            const tick = () => {
                const word = words[w];
                typedEl.textContent = word.slice(0, c);
                if (!deleting && c < word.length) { c++; setTimeout(tick, 70); }
                else if (!deleting) { deleting = true; setTimeout(tick, 1600); }
                else if (c > 0) { c--; setTimeout(tick, 35); }
                else { deleting = false; w = (w + 1) % words.length; setTimeout(tick, 300); }
            };
            tick();
        }
    }

    // 7. Contadores animados
    const counters = document.querySelectorAll("[data-count]");
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = +el.dataset.count;
            const suffix = el.dataset.suffix || "";
            if (reduceMotion) { el.textContent = target + suffix; observer.unobserve(el); return; }
            const duration = 1400;
            const start = performance.now();
            const step = now => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            observer.unobserve(el);
        });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObserver.observe(c));

    // 8. Luz que sigue al cursor (solo con mouse)
    const glow = document.querySelector(".cursor-glow");
    if (glow && window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
        window.addEventListener("mousemove", e => {
            glow.style.left = `${e.clientX}px`;
            glow.style.top = `${e.clientY}px`;
        }, { passive: true });
    } else if (glow) {
        glow.style.display = "none";
    }

    // ---- Videos del canal: lectura automática (con respaldo) ----
    const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL_ID}`;
    const CACHE_KEY = "ltp:videos-canal";
    const CACHE_MS = 30 * 60 * 1000;

    const parseId = v => {
        const s = String(v || "").trim();
        const m = s.match(/(?:[?&]v=|youtu\.be\/|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
        return m ? m[1] : (/^[\w-]{11}$/.test(s) ? s : null);
    };
    // quita hashtags sueltos del título (muy comunes en Shorts)
    const cleanTitle = t => {
        const raw = String(t || "").replace(/\s+/g, " ").trim();
        const cut = raw.replace(/(\s*#[^\s#]+)+\s*$/u, "").trim();
        return (cut || raw).slice(0, 90);
    };
    // etiqueta cian según el título; los videos de VIDEOS conservan la suya
    const guessTag = t => {
        if (/camioneta|raptor|f-?150|ford|ram\b|silverado|sierra|tacoma|hilux|ranger|pickup|troca|4x4|chevrolet|toyota|dodge|jeep/i.test(t)) return "Camionetas";
        if (/windows|word|excel|powerpoint|atajo|tip|\bpc\b|computadora|laptop|office|teclado|python|java|sql|c#|program/i.test(t)) return "Tips de PC";
        return "YouTube";
    };
    const manual = new Map((typeof VIDEOS !== "undefined" ? VIDEOS : []).map(v => [parseId(v.id), v]).filter(([id]) => id));
    const withManual = list => list.map(v => (manual.has(v.id) ? { ...v, ...manual.get(v.id), id: v.id } : v));

    const withTimeout = (url, ms = 5000) => {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), ms);
        return fetch(url, { signal: ctl.signal }).finally(() => clearTimeout(t));
    };
    const fromApi = async () => {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${Math.min(MAX_VIDEOS, 50)}` +
                    `&playlistId=${"UU" + CANAL_ID.slice(2)}&key=${encodeURIComponent(YT_API_KEY)}`;
        const r = await withTimeout(url);
        if (!r.ok) throw new Error("api");
        const d = await r.json();
        return (d.items || [])
            .map(it => ({ id: it.snippet && it.snippet.resourceId && it.snippet.resourceId.videoId, title: it.snippet && it.snippet.title }))
            .filter(v => v.title !== "Private video" && v.title !== "Deleted video");
    };
    const fromFeedJson = async () => {
        const r = await withTimeout(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED_URL)}`);
        if (!r.ok) throw new Error("rss2json");
        const d = await r.json();
        if (d.status !== "ok") throw new Error("rss2json");
        return (d.items || []).map(it => ({ id: String(it.guid || "").replace(/^yt:video:/, "") || it.link, title: it.title }));
    };
    const fromFeedXml = async () => {
        const r = await withTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(FEED_URL)}`);
        if (!r.ok) throw new Error("allorigins");
        const doc = new DOMParser().parseFromString(await r.text(), "text/xml");
        return [...doc.getElementsByTagName("entry")].map(e => {
            const id = e.getElementsByTagName("yt:videoId")[0];
            const title = e.getElementsByTagName("title")[0];
            return { id: id && id.textContent, title: title && title.textContent };
        });
    };
    const fetchChannelVideos = async () => {
        const sources = YT_API_KEY ? [fromApi, fromFeedJson, fromFeedXml] : [fromFeedJson, fromFeedXml];
        for (const source of sources) {
            try {
                const seen = new Set();
                const list = (await source())
                    .map(v => ({ id: parseId(v.id), title: cleanTitle(v.title) }))
                    .filter(v => v.id && v.title && !seen.has(v.id) && seen.add(v.id));
                if (list.length) return list.slice(0, MAX_VIDEOS);
            } catch (e) { /* prueba la siguiente fuente */ }
        }
        return null;
    };
    const readCache = () => {
        try {
            const c = JSON.parse(localStorage.getItem(CACHE_KEY));
            return c && Array.isArray(c.list) && c.list.length ? c : null;
        } catch (e) { return null; }
    };
    const writeCache = list => { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), list })); } catch (e) {} };

    // Los Shorts son verticales (por defecto); si el video es horizontal se centra en 16:9
    const detectWide = box => {
        fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + box.dataset.id)}`)
            .then(r => (r.ok ? r.json() : null))
            .then(d => { if (d && d.width && d.height && d.width / d.height > 1.2) box.classList.add("wide"); })
            .catch(() => {});
    };

    const initShowcase = list => {
        // 9. Videos: miniatura de YouTube (rápida) -> al tocar se carga el reproductor -> al terminar vuelve la miniatura
        //    (se arma con la lista que llega del canal)
        const track = document.getElementById("stageTrack");
        const items = list.map(v => ({ ...v, id: parseId(v.id) })).filter(v => v.id);

        if (track) {
            items.forEach(v => {
                const title = v.title || "Video de Ltecnopaso";
                const tag = v.tag || guessTag(title);

                const fig = document.createElement("figure");
                fig.className = "slide";
                fig.dataset.id = v.id;
                fig.dataset.tag = tag;
                fig.dataset.title = title;

                const frame = document.createElement("div");
                frame.className = "slide-frame";
                const box = document.createElement("div");
                box.className = "card-video vertical";
                box.dataset.id = v.id;
                box.dataset.title = title;

                const cover = document.createElement("button");
                cover.type = "button";
                cover.className = "slide-cover";
                cover.setAttribute("aria-label", `Ver: ${title}`);

                frame.append(box);
                fig.append(frame, cover);
                track.append(fig);
            });
        }

        const videoBoxes = [...document.querySelectorAll(".card-video[data-id]")];
        let ytQueue = [];

        const loadYT = cb => {
            if (window.YT && window.YT.Player) { cb(); return; }
            ytQueue.push(cb);
            if (!document.getElementById("yt-api")) {
                const tag = document.createElement("script");
                tag.id = "yt-api";
                tag.src = "https://www.youtube.com/iframe_api";
                document.head.appendChild(tag);
                window.onYouTubeIframeAPIReady = () => { ytQueue.forEach(fn => fn()); ytQueue = []; };
            }
        };

        // Portada = el propio reproductor de YouTube sin autoplay (muestra el logo de Shorts y el video completo).
        // Al terminar, o al cambiar de video, se vuelve a montar para regresar a la portada.
        const mountVideo = box => {
            try { if (box._yt && box._yt.destroy) box._yt.destroy(); } catch (e) {}
            box._yt = null;
            box._active = false;
            box.classList.remove("is-playing");
            box.querySelectorAll("iframe").forEach(f => f.remove());
            box._mounted = true;

            const frame = document.createElement("iframe");
            let src = `https://www.youtube.com/embed/${box.dataset.id}?rel=0&playsinline=1&enablejsapi=1`;
            if (location.protocol.startsWith("http")) src += `&origin=${encodeURIComponent(location.origin)}`;
            frame.src = src;
            frame.title = box.dataset.title || "Video de Ltecnopaso";
            frame.loading = "lazy";
            frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            frame.setAttribute("allowfullscreen", "");
            frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
            box.appendChild(frame);

            loadYT(() => {
                if (!frame.isConnected) return;
                box._yt = new YT.Player(frame, {
                    events: {
                        onStateChange: e => {
                            if (e.data === 1 && !box._active) {            // empezó a reproducirse
                                box._active = true;
                                box.classList.add("is-playing");
                                videoBoxes.forEach(o => { if (o !== box && o._active) mountVideo(o); });
                                document.dispatchEvent(new CustomEvent("ltp:video-play"));
                            }
                            if (e.data === 0) mountVideo(box);               // terminó: vuelve la portada
                        }
                    }
                });
            });
        };

        // 10. Escenario 3D: carrusel de videos
        const stage = document.getElementById("stage");
        if (!items.length) {
            const sc = document.querySelector(".showcase");
            const hn = document.getElementById("videoHint");
            if (sc) sc.hidden = true;
            if (hn) hn.hidden = true;
        }
        if (stage && items.length) {
            const slides = [...stage.querySelectorAll(".slide")];
            const n = slides.length;
            if (n < 2) stage.querySelectorAll(".stage-nav").forEach(b => { b.hidden = true; });
            const hint = document.getElementById("videoHint");
            const tagEl = document.getElementById("stageTag");
            const titleEl = document.getElementById("stageTitle");
            const linkEl = document.getElementById("stageLink");
            const curEl = document.getElementById("stageCur");
            const ghost = document.getElementById("stageGhost");
            const dotsEl = document.getElementById("stageDots");
            const totalEl = document.getElementById("stageTotal");
            if (totalEl) totalEl.textContent = String(n).padStart(2, "0");
            let cur = 0, interacted = false, visible = false;

            slides.forEach((s, i) => s.style.setProperty("--i", Math.min(i, 8)));
            const dots = slides.map((s, i) => {
                const b = document.createElement("button");
                b.type = "button";
                b.setAttribute("aria-label", `Ir al video ${i + 1}`);
                b.addEventListener("click", () => { markInteracted(); go(i); });
                dotsEl.appendChild(b);
                return b;
            });

            const pop = el => { el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };

            const render = () => {
                slides.forEach((s, i) => {
                    let d = (i - cur + n) % n;
                    if (d > n / 2) d -= n;
                    s.dataset.pos = d;
                    s.setAttribute("aria-hidden", d !== 0 ? "true" : "false");
                    const vb = s.querySelector(".card-video");
                    if (vb && Math.abs(d) <= 1 && !vb._mounted) mountVideo(vb);
                    const frame = s.querySelector(".slide-frame");
                    if ("inert" in frame) frame.inert = d !== 0;
                });
                dots.forEach((b, i) => b.classList.toggle("on", i === cur));
                const s = slides[cur];
                tagEl.textContent = s.dataset.tag;
                titleEl.textContent = s.dataset.title;
                if (linkEl) linkEl.href = `https://youtu.be/${s.dataset.id}`;
                const num = String(cur + 1).padStart(2, "0");
                curEl.textContent = num;
                ghost.textContent = num;
                pop(titleEl); pop(tagEl);
            };

            const go = i => {
                // el video que estaba activo vuelve a su portada
                videoBoxes.forEach(b => { if (b._active) mountVideo(b); });
                cur = (i + n) % n;
                render();
            };

            function markInteracted() {
                interacted = true;
                if (hint) hint.classList.add("gone");
            }

            document.getElementById("stagePrev").addEventListener("click", () => { markInteracted(); go(cur - 1); });
            document.getElementById("stageNext").addEventListener("click", () => { markInteracted(); go(cur + 1); });
            slides.forEach((s, i) => s.querySelector(".slide-cover").addEventListener("click", () => { markInteracted(); go(i); }));

            stage.addEventListener("keydown", e => {
                if (e.key === "ArrowLeft")  { markInteracted(); go(cur - 1); }
                if (e.key === "ArrowRight") { markInteracted(); go(cur + 1); }
            });

            let sx = null, sy = null;
            stage.addEventListener("pointerdown", e => {
                if (e.target.closest("iframe, .stage-nav, .stage-dots, .stage-link")) { sx = null; return; }
                sx = e.clientX; sy = e.clientY;
            });
            stage.addEventListener("pointerup", e => {
                if (sx === null) return;
                const dx = e.clientX - sx, dy = e.clientY - sy;
                sx = sy = null;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) { markInteracted(); go(dx < 0 ? cur + 1 : cur - 1); }
            });
            stage.addEventListener("pointercancel", () => { sx = sy = null; });

            document.addEventListener("ltp:video-play", markInteracted);

            // Entrada en abanico al llegar a la sección + avance automático hasta que alguien interactúe
            render();
            stage.classList.add("fan");
            const stageObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    visible = entry.isIntersecting;
                    if (entry.isIntersecting && !stage.classList.contains("in")) {
                        stage.classList.add("in");
                        setTimeout(() => stage.classList.remove("fan"), 1500);
                    }
                });
            }, { threshold: 0.35 });
            stageObserver.observe(stage);

            if (!reduceMotion) {
                setInterval(() => {
                    if (interacted || !visible || document.hidden || stage.matches(":hover")) return;
                    go(cur + 1);
                }, 5500);
            }
        }

    };

    // Arranque: con copia reciente se muestra al instante; si no, se espera al canal (máx. 5 s) y, si falla, usa VIDEOS
    const cached = readCache();
    const refresh = () => fetchChannelVideos().then(l => { if (l) writeCache(l); return l; });
    if (cached) {
        initShowcase(withManual(cached.list));
        if (Date.now() - cached.t > CACHE_MS) refresh();
    } else {
        refresh().then(l => initShowcase(l ? withManual(l) : VIDEOS));
    }

    // 11. Interactividad global
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    // Inclinación 3D con luz en tarjetas, estadísticas y banner
    document.querySelectorAll(".stat, .service-card").forEach(el => { el.dataset.tilt = "10"; });
    const bannerEl = document.querySelector(".yt-banner");
    if (bannerEl) bannerEl.dataset.tilt = "3";
    if (finePointer && !reduceMotion) {
        document.querySelectorAll("[data-tilt]").forEach(el => {
            const max = +el.dataset.tilt || 8;
            el.addEventListener("pointermove", e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                el.style.transition = "transform .12s ease-out";
                el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-5px) scale(1.02)`;
                el.style.setProperty("--mx", `${x * 100}%`);
                el.style.setProperty("--my", `${y * 100}%`);
            });
            el.addEventListener("pointerleave", () => {
                el.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1)";
                el.style.transform = "";
            });
        });

        // Botones y enlaces con efecto imán
        document.querySelectorAll(".btn, .social-icon, .nav-cta, .copy-btn, .stage-nav, .to-top").forEach(el => {
            el.addEventListener("pointermove", e => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                el.style.translate = `${x * 0.25}px ${y * 0.35}px`;
            });
            el.addEventListener("pointerleave", () => { el.style.translate = ""; });
        });

        // Parallax suave: avatar y luces de fondo siguen el mouse
        const avatarEl = document.querySelector(".avatar-container");
        const orbEls = document.querySelectorAll(".orb");
        window.addEventListener("pointermove", e => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            if (avatarEl) avatarEl.style.translate = `${nx * -14}px ${ny * -10}px`;
            orbEls.forEach((o, i) => { o.style.translate = `${nx * (i ? -70 : 70)}px ${ny * (i ? -45 : 45)}px`; });
        }, { passive: true });
    }

    // Chispas al hacer clic
    if (!reduceMotion) {
        const sparkLayer = document.createElement("div");
        sparkLayer.className = "sparks";
        document.body.appendChild(sparkLayer);
        window.addEventListener("pointerdown", e => {
            for (let i = 0; i < 10; i++) {
                const spark = document.createElement("i");
                const a = Math.random() * Math.PI * 2;
                const d = 30 + Math.random() * 55;
                spark.style.left = `${e.clientX}px`;
                spark.style.top = `${e.clientY}px`;
                spark.style.setProperty("--dx", `${Math.cos(a) * d}px`);
                spark.style.setProperty("--dy", `${Math.sin(a) * d}px`);
                sparkLayer.appendChild(spark);
                setTimeout(() => spark.remove(), 750);
            }
        });
    }

    // Tags con rebote al tocarlos
    document.querySelectorAll(".tag").forEach(tag => {
        tag.addEventListener("click", () => {
            tag.classList.remove("pulse"); void tag.offsetWidth; tag.classList.add("pulse");
        });
    });

    // Aviso corto
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    let toastTimer;
    const showToast = msg => {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
    };

    // Correo: el texto sale del href; si sigue el valor de ejemplo, el CSS oculta el bloque
    const copyBtn = document.getElementById("copyMail");
    const mailLink = document.getElementById("mailLink");
    if (mailLink) {
        const mailAddr = (mailLink.getAttribute("href") || "").replace(/^mailto:/i, "").split("?")[0].trim();
        const mailReady = mailAddr !== "" && !mailAddr.includes("TU_CORREO");
        if (mailReady) mailLink.textContent = mailAddr;
        if (copyBtn && mailReady) {
            copyBtn.addEventListener("click", async () => {
                try { await navigator.clipboard.writeText(mailAddr); showToast("¡Correo copiado!"); }
                catch (err) {
                    const t = document.createElement("textarea");
                    t.value = mailAddr; document.body.appendChild(t); t.select();
                    try { document.execCommand("copy"); showToast("¡Correo copiado!"); } catch (e2) { showToast(mailAddr); }
                    t.remove();
                }
            });
        }
    }

    // WhatsApp / correo para contratar: si aún tienen el valor de ejemplo, avisa en lugar de abrir algo roto
    [["waLink", "XXXXXXXX", "Pon tu número de WhatsApp en index.html"], ["mailIcon", "TU_CORREO", "Pon tu correo en index.html"]].forEach(([id, ph, msg]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", e => { if ((el.getAttribute("href") || "").includes(ph)) { e.preventDefault(); showToast(msg); } });
    });


    // Decoración lateral: sección activa, progreso y parallax suave de los chips
    const railLinks = [...document.querySelectorAll(".side-rail.left a")];
    if (railLinks.length) {
        const secs = railLinks.map(a => document.getElementById(a.dataset.sec)).filter(Boolean);
        const railFill = document.getElementById("railFill");
        const railPct = document.getElementById("railPct");
        const updateRail = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
            if (railFill) railFill.style.height = `${p * 100}%`;
            if (railPct) railPct.textContent = String(Math.round(p * 100)).padStart(2, "0");
            const mid = window.innerHeight * .45;
            let cur = secs[0];
            secs.forEach(sec => { if (sec.getBoundingClientRect().top <= mid) cur = sec; });
            railLinks.forEach(a => a.classList.toggle("on", cur && a.dataset.sec === cur.id));
        };
        window.addEventListener("scroll", updateRail, { passive: true });
        window.addEventListener("resize", updateRail);
        updateRail();
    }
    const fxChips = [...document.querySelectorAll(".fx-chip")];
    if (fxChips.length && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("mousemove", e => {
            const nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
            fxChips.forEach((c, i) => {
                const k = 18 + (i % 5) * 8;
                c.style.setProperty("--px", `${-nx * k}px`);
                c.style.setProperty("--py", `${-ny * k}px`);
            });
        }, { passive: true });
    }


    // Variante lateral HUD: tips rotando, velocímetro = progreso de scroll, RPM reaccionan al scroll
    const hud = document.getElementById("sideHud");
    if (hud) {
        const tips = [...hud.querySelectorAll(".hud-tip")];
        let ti = 0;
        if (!reduceMotion) setInterval(() => {
            if (document.hidden) return;
            tips[ti].classList.remove("on");
            ti = (ti + 1) % tips.length;
            tips[ti].classList.add("on");
        }, 4500);
        const arc = document.getElementById("hudArc"), kmh = document.getElementById("hudKmh"), speed = hud.querySelector(".hud-speed");
        const eq = hud.querySelector(".hud-eq"), bars = [...hud.querySelectorAll(".hud-bars i")];
        let revT, lastY = window.scrollY;
        const hudUpdate = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
            arc.style.strokeDashoffset = String(100 - p * 100);
            kmh.textContent = String(Math.round(p * 240));
            speed.classList.toggle("hot", p > .8);
            const v = Math.abs(window.scrollY - lastY); lastY = window.scrollY;
            if (v > 8) {
                eq.classList.add("rev");
                clearTimeout(revT);
                revT = setTimeout(() => eq.classList.remove("rev"), 450);
            }
        };
        window.addEventListener("scroll", hudUpdate, { passive: true });
        hudUpdate();
        bars.forEach((b, i) => b.style.setProperty("--lvl", String(1 - i / bars.length)));
    }

    // Volver arriba
    const toTop = document.getElementById("toTop");
    if (toTop) {
        window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 600), { passive: true });
        toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    }
});
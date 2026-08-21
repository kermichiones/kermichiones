/* =========================================================================
   ArvasDirect — arayuz betikleri
   Header menusu, banner karusel, arama onerileri, arama/arsiv filtreleri
   ========================================================================= */
(function () {
    'use strict';

    /* ---------------------------------------------------------------------
       Ortak yardimcilar
       --------------------------------------------------------------------- */
    var INDEX_URL = '/search.json';
    var indexPromise = null;

    function loadIndex() {
        if (!indexPromise) {
            indexPromise = fetch(INDEX_URL)
                .then(function (r) {
                    if (!r.ok) throw new Error('index ' + r.status);
                    return r.json();
                })
                .catch(function (err) {
                    console.error('[ArvasDirect] arama dizini yuklenemedi:', err);
                    return [];
                });
        }
        return indexPromise;
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function normalize(str) {
        return String(str == null ? '' : str)
            .toLocaleLowerCase('tr')
            .replace(/[ıİ]/g, 'i')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c')
            .replace(/[âÂ]/g, 'a');
    }

    var COLLECTION_LABELS = {
        posts: { label: 'Blog', chip: 'sd-chip-blog', tr: 'Yazı', en: 'Article' },
        projects: { label: 'Proje', chip: 'sd-chip-proj', tr: 'Proje', en: 'Project' }
    };

    function collectionInfo(name) {
        return COLLECTION_LABELS[name] || COLLECTION_LABELS.posts;
    }

    function param(name) {
        return new URLSearchParams(window.location.search).get(name) || '';
    }

    /* ---------------------------------------------------------------------
       1) Header: mobil menu
       --------------------------------------------------------------------- */
    function initHeaderMenu() {
        var btn = document.getElementById('gh-menu-btn');
        var drawer = document.getElementById('gh-drawer');
        if (!btn || !drawer) return;

        btn.addEventListener('click', function () {
            var open = drawer.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
                drawer.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                btn.focus();
            }
        });
    }

    /* ---------------------------------------------------------------------
       2) Banner karusel
       --------------------------------------------------------------------- */
    function initCarousel() {
        var carousel = document.querySelector('[data-sd-carousel]');
        if (!carousel) return;

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.sd-slide'));
        var tabs = Array.prototype.slice.call(carousel.querySelectorAll('[data-sd-slide-index]'));
        if (slides.length < 2) return;

        var current = 0;
        var timer = null;
        var DELAY = 7000;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            tabs.forEach(function (tab, i) {
                var selected = i === current;
                tab.setAttribute('aria-selected', selected ? 'true' : 'false');
                tab.tabIndex = selected ? 0 : -1;
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () { show(current + 1); }, DELAY);
        }
        function stop() {
            if (timer) { window.clearInterval(timer); timer = null; }
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { show(i); start(); });
            tab.addEventListener('keydown', function (e) {
                if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); tabs[current].focus(); }
                if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); tabs[current].focus(); }
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('focusin', stop);
        carousel.addEventListener('focusout', start);

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            show(0);
        } else {
            show(0);
            start();
        }
    }

    /* ---------------------------------------------------------------------
       3) Arama onerileri (autosuggest)
       --------------------------------------------------------------------- */
    function initSuggest() {
        var input = document.getElementById('qs');
        var box = document.getElementById('qs-suggest');
        if (!input || !box) return;

        var items = [];
        var active = -1;
        var results = [];

        input.addEventListener('focus', function () {
            loadIndex().then(function (data) { items = data; });
        });

        function close() {
            box.classList.remove('is-open');
            box.innerHTML = '';
            input.setAttribute('aria-expanded', 'false');
            active = -1;
        }

        function render(term) {
            var q = normalize(term).trim();
            if (q.length < 2) { close(); return; }

            results = items.filter(function (it) {
                return normalize(it.title).indexOf(q) !== -1 ||
                       normalize(it.description || '').indexOf(q) !== -1 ||
                       (it.tags || []).some(function (t) { return normalize(t).indexOf(q) !== -1; });
            }).slice(0, 7);

            if (!results.length) { close(); return; }

            box.innerHTML = results.map(function (it, i) {
                var info = collectionInfo(it.collection);
                return '<button type="button" role="option" data-index="' + i + '" aria-selected="false">' +
                       '<span class="sd-suggest-type">' + escapeHtml(info.tr) + ' &middot; ' + escapeHtml(it.date || '') + '</span>' +
                       escapeHtml(it.title) +
                       '</button>';
            }).join('');

            box.classList.add('is-open');
            input.setAttribute('aria-expanded', 'true');
            active = -1;

            Array.prototype.forEach.call(box.querySelectorAll('button'), function (btn) {
                btn.addEventListener('mousedown', function (e) {
                    e.preventDefault();
                    window.location.href = results[parseInt(btn.dataset.index, 10)].url;
                });
            });
        }

        function highlight() {
            var buttons = box.querySelectorAll('button');
            Array.prototype.forEach.call(buttons, function (btn, i) {
                btn.setAttribute('aria-selected', i === active ? 'true' : 'false');
            });
        }

        input.addEventListener('input', function () { render(input.value); });

        input.addEventListener('keydown', function (e) {
            var count = box.querySelectorAll('button').length;
            if (!count) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                active = (active + 1) % count;
                highlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                active = (active - 1 + count) % count;
                highlight();
            } else if (e.key === 'Enter' && active > -1) {
                e.preventDefault();
                window.location.href = results[active].url;
            } else if (e.key === 'Escape') {
                close();
            }
        });

        document.addEventListener('click', function (e) {
            if (!box.contains(e.target) && e.target !== input) close();
        });
    }

    /* ---------------------------------------------------------------------
       4) Arama sonuclari sayfasi
       --------------------------------------------------------------------- */
    function scoreItem(item, terms) {
        if (!terms.length) return 1;
        var title = normalize(item.title);
        var body = normalize(item.body || '');
        var desc = normalize(item.description || '');
        var tags = normalize((item.tags || []).join(' ') + ' ' + (item.categories || []).join(' '));
        var score = 0;

        for (var i = 0; i < terms.length; i++) {
            var t = terms[i];
            var hit = 0;
            if (title.indexOf(t) !== -1) { hit += 12; }
            if (tags.indexOf(t) !== -1) { hit += 6; }
            if (desc.indexOf(t) !== -1) { hit += 4; }
            if (body.indexOf(t) !== -1) { hit += 2; }
            if (!hit) return 0;           // her terim bulunmali (AND)
            score += hit;
        }
        return score;
    }

    function snippetFor(item, terms) {
        var raw = item.body || item.description || '';
        if (!raw) return '';
        var lower = normalize(raw);
        var pos = -1;
        for (var i = 0; i < terms.length && pos === -1; i++) {
            pos = lower.indexOf(terms[i]);
        }
        var start = pos > 90 ? pos - 90 : 0;
        var text = raw.substr(start, 260);
        if (start > 0) text = '…' + text;
        if (raw.length > start + 260) text = text + '…';

        var out = escapeHtml(text);
        terms.forEach(function (t) {
            if (!t) return;
            try {
                var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                out = out.replace(re, '<mark>$1</mark>');
            } catch (err) { /* yoksay */ }
        });
        return out;
    }

    function resultRow(item, index, terms) {
        var info = collectionInfo(item.collection);
        var meta = [];
        meta.push('<span class="sd-chip ' + info.chip + '">' + escapeHtml(info.label) + '</span>');
        meta.push('<span>' + escapeHtml(item.date || '') + '</span>');
        if (item.author) meta.push('<span>' + escapeHtml(item.author) + '</span>');
        if (item.director) meta.push('<span>Yön. ' + escapeHtml(item.director) + '</span>');
        if (item.rating) meta.push('<span>★ ' + escapeHtml(item.rating) + '/10</span>');

        var thumb = item.image
            ? '<img src="' + escapeHtml(item.image) + '" alt="">'
            : (item.collection === 'projects' ? '⚙' : '¶');

        var tags = (item.tags || []).concat(item.categories || []).slice(0, 5);

        return '<li class="sd-result">' +
            '<span class="sd-result-index">' + (index + 1) + '</span>' +
            '<span class="sd-result-thumb">' + thumb + '</span>' +
            '<div class="sd-result-main">' +
                '<h3 class="sd-result-title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                '<div class="sd-result-meta">' + meta.join('') + '</div>' +
                '<p class="sd-result-snippet">' + snippetFor(item, terms) + '</p>' +
                '<div class="sd-result-links">' +
                    '<a href="' + escapeHtml(item.url) + '">Tam metni görüntüle</a>' +
                    (tags.length ? '<span>' + tags.map(function (t) { return escapeHtml(t); }).join(', ') + '</span>' : '') +
                '</div>' +
            '</div>' +
        '</li>';
    }

    function initSearchPage() {
        var root = document.getElementById('sd-search-results');
        if (!root) return;

        var listEl = document.getElementById('sd-result-list');
        var countEl = document.getElementById('sd-result-count');
        var summaryEl = document.getElementById('sd-query-summary');
        var sortEl = document.getElementById('sd-sort');
        var facetsEl = document.getElementById('sd-facets');
        var termsInput = document.getElementById('sd-refine-qs');
        var authorInput = document.getElementById('sd-refine-authors');
        var refineForm = document.getElementById('sd-refine-form');

        var all = [];
        var state = {
            qs: param('qs'),
            pub: param('pub'),
            authors: param('authors'),
            sort: 'relevance',
            collections: [],
            years: []
        };

        if (termsInput) termsInput.value = state.qs;
        if (authorInput) authorInput.value = state.authors;
        if (state.pub) state.collections = [state.pub];

        function terms() {
            return normalize(state.qs).split(/\s+/).filter(Boolean);
        }

        function matches(item) {
            if (state.collections.length && state.collections.indexOf(item.collection) === -1) return false;
            if (state.years.length && state.years.indexOf(item.year) === -1) return false;
            if (state.authors) {
                var hay = normalize((item.author || '') + ' ' + (item.tags || []).join(' ') + ' ' + (item.categories || []).join(' ') + ' ' + (item.director || ''));
                if (hay.indexOf(normalize(state.authors)) === -1) return false;
            }
            return scoreItem(item, terms()) > 0;
        }

        function renderFacets(pool) {
            if (!facetsEl) return;

            var byCollection = {};
            var byYear = {};
            pool.forEach(function (it) {
                byCollection[it.collection] = (byCollection[it.collection] || 0) + 1;
                byYear[it.year] = (byYear[it.year] || 0) + 1;
            });

            var collKeys = ['posts', 'projects'];
            var html = '<div class="sd-facet"><h3>İçerik türü</h3>';
            collKeys.forEach(function (key) {
                var info = collectionInfo(key);
                html += '<label><input type="checkbox" data-facet="collection" value="' + key + '"' +
                    (state.collections.indexOf(key) !== -1 ? ' checked' : '') + '> ' +
                    escapeHtml(info.tr) +
                    '<span class="sd-facet-count">' + (byCollection[key] || 0) + '</span></label>';
            });
            html += '</div>';

            html += '<div class="sd-facet"><h3>Yıl</h3>';
            Object.keys(byYear).sort().reverse().forEach(function (year) {
                html += '<label><input type="checkbox" data-facet="year" value="' + escapeHtml(year) + '"' +
                    (state.years.indexOf(year) !== -1 ? ' checked' : '') + '> ' +
                    escapeHtml(year) +
                    '<span class="sd-facet-count">' + byYear[year] + '</span></label>';
            });
            html += '</div>';

            facetsEl.innerHTML = html;

            Array.prototype.forEach.call(facetsEl.querySelectorAll('input[type=checkbox]'), function (cb) {
                cb.addEventListener('change', function () {
                    var bucket = cb.dataset.facet === 'year' ? state.years : state.collections;
                    var idx = bucket.indexOf(cb.value);
                    if (cb.checked && idx === -1) bucket.push(cb.value);
                    if (!cb.checked && idx !== -1) bucket.splice(idx, 1);
                    render();
                });
            });
        }

        function render() {
            var t = terms();
            var found = all.filter(matches);

            if (state.sort === 'date') {
                found.sort(function (a, b) { return (a.date < b.date) ? 1 : -1; });
            } else if (state.sort === 'date-asc') {
                found.sort(function (a, b) { return (a.date > b.date) ? 1 : -1; });
            } else if (state.sort === 'title') {
                found.sort(function (a, b) { return normalize(a.title) < normalize(b.title) ? -1 : 1; });
            } else {
                found.sort(function (a, b) {
                    var d = scoreItem(b, t) - scoreItem(a, t);
                    return d !== 0 ? d : (a.date < b.date ? 1 : -1);
                });
            }

            if (countEl) {
                countEl.innerHTML = '<span>' + found.length + '</span> sonuç';
            }

            if (summaryEl) {
                var bits = [];
                if (state.qs) bits.push('“' + escapeHtml(state.qs) + '”');
                if (state.authors) bits.push('yazar/etiket: ' + escapeHtml(state.authors));
                if (state.collections.length) {
                    bits.push('koleksiyon: ' + state.collections.map(function (c) { return escapeHtml(collectionInfo(c).tr); }).join(', '));
                }
                if (state.years.length) bits.push('yıl: ' + state.years.join(', '));
                summaryEl.innerHTML = bits.length ? bits.join(' &nbsp;•&nbsp; ') : 'Tüm kayıtlar listeleniyor';
            }

            if (listEl) {
                if (!found.length) {
                    listEl.innerHTML = '<li><div class="sd-empty"><strong>Sonuç bulunamadı.</strong><br>' +
                        'Terimleri sadeleştirin, filtreleri kaldırın ya da <a href="/arsiv/">tüm arşive</a> göz atın.</div></li>';
                } else {
                    listEl.innerHTML = found.map(function (item, i) { return resultRow(item, i, t); }).join('');
                }
            }

            renderFacets(all.filter(function (it) {
                if (state.authors) {
                    var hay = normalize((it.author || '') + ' ' + (it.tags || []).join(' ') + ' ' + (it.director || ''));
                    if (hay.indexOf(normalize(state.authors)) === -1) return false;
                }
                return scoreItem(it, terms()) > 0;
            }));
        }

        if (sortEl) {
            sortEl.addEventListener('change', function () {
                state.sort = sortEl.value;
                render();
            });
        }

        if (refineForm) {
            refineForm.addEventListener('submit', function (e) {
                e.preventDefault();
                state.qs = termsInput ? termsInput.value : '';
                state.authors = authorInput ? authorInput.value : '';
                var url = new URL(window.location.href);
                url.searchParams.set('qs', state.qs);
                url.searchParams.set('authors', state.authors);
                window.history.replaceState({}, '', url);
                render();
            });
        }

        loadIndex().then(function (data) {
            all = data;
            render();
        });
    }

    /* ---------------------------------------------------------------------
       5) Arsiv sayfasi filtreleri (Liquid ile basilmis satirlari filtreler)
       --------------------------------------------------------------------- */
    function initArchiveFilter() {
        var root = document.getElementById('sd-archive');
        if (!root) return;

        var rows = Array.prototype.slice.call(root.querySelectorAll('[data-archive-row]'));
        var searchInput = document.getElementById('sd-archive-search');
        var countEl = document.getElementById('sd-archive-count');
        var emptyEl = document.getElementById('sd-archive-empty');
        var boxes = Array.prototype.slice.call(root.querySelectorAll('input[data-archive-facet]'));
        var letter = param('letter');
        var initialQuery = param('q');

        if (initialQuery && searchInput) searchInput.value = initialQuery;

        function apply() {
            var q = normalize(searchInput ? searchInput.value : '');
            var activeTypes = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
            var visible = 0;

            rows.forEach(function (row) {
                var okType = !activeTypes.length || activeTypes.indexOf(row.dataset.type) !== -1;
                var okText = !q || normalize(row.dataset.title + ' ' + (row.dataset.tags || '')).indexOf(q) !== -1;
                var okLetter = !letter || normalize(row.dataset.title).charAt(0) === normalize(letter);
                var show = okType && okText && okLetter;
                row.style.display = show ? '' : 'none';
                if (show) visible++;
            });

            if (countEl) countEl.innerHTML = '<span>' + visible + '</span> kayıt';
            if (emptyEl) emptyEl.style.display = visible ? 'none' : 'block';

            // Bos yil gruplarini gizle
            Array.prototype.forEach.call(root.querySelectorAll('[data-archive-group]'), function (group) {
                var anyVisible = Array.prototype.some.call(group.querySelectorAll('[data-archive-row]'), function (r) {
                    return r.style.display !== 'none';
                });
                group.style.display = anyVisible ? '' : 'none';
            });
        }

        if (searchInput) searchInput.addEventListener('input', apply);
        boxes.forEach(function (b) { b.addEventListener('change', apply); });

        var clearBtn = document.getElementById('sd-archive-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                if (searchInput) searchInput.value = '';
                boxes.forEach(function (b) { b.checked = false; });
                letter = '';
                var url = new URL(window.location.href);
                url.search = '';
                window.history.replaceState({}, '', url);
                var badge = document.getElementById('sd-archive-letter-badge');
                if (badge) badge.style.display = 'none';
                apply();
            });
        }

        if (letter) {
            var badgeEl = document.getElementById('sd-archive-letter-badge');
            if (badgeEl) {
                badgeEl.style.display = '';
                badgeEl.textContent = 'Harf filtresi: ' + letter.toUpperCase();
            }
        }

        apply();
    }


    /* ---------------------------------------------------------------------
       6) Kopyala / paylas dugmeleri
       --------------------------------------------------------------------- */
    function flash(btn, message) {
        var note = document.createElement('span');
        note.className = 'sd-copied';
        note.textContent = message;
        btn.insertAdjacentElement('afterend', note);
        window.setTimeout(function () { note.remove(); }, 2200);
    }

    function initCopyShare() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-sd-copy]'), function (btn) {
            btn.addEventListener('click', function () {
                var target = document.getElementById(btn.getAttribute('data-sd-copy'));
                if (!target) return;
                var text = target.innerText.replace(/\s+/g, ' ').trim();
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        flash(btn, 'Kopyalandi');
                    }).catch(function () { flash(btn, 'Kopyalanamadi'); });
                } else {
                    flash(btn, 'Tarayici desteklemiyor');
                }
            });
        });

        Array.prototype.forEach.call(document.querySelectorAll('[data-sd-share]'), function (btn) {
            btn.addEventListener('click', function () {
                var data = {
                    title: document.title,
                    url: window.location.href
                };
                if (navigator.share) {
                    navigator.share(data).catch(function () { /* iptal */ });
                } else if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(data.url).then(function () {
                        flash(btn, 'Baglanti kopyalandi');
                    });
                }
            });
        });
    }


    /* ---------------------------------------------------------------------
       7) Makale okuma gorunumu: bolum numaralari, anahat, sekiller, serit
       --------------------------------------------------------------------- */
    function slugify(text, fallback) {
        var slug = normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return slug || fallback;
    }

    function numberSections(body) {
        var headings = Array.prototype.slice.call(body.querySelectorAll('h2, h3'));
        var major = 0, minor = 0;
        var entries = [];

        headings.forEach(function (h) {
            var isMajor = h.tagName === 'H2';
            if (isMajor) { major++; minor = 0; } else { minor++; }
            if (!isMajor && major === 0) { major = 1; }

            var label = isMajor ? major + '.' : major + '.' + minor + '.';
            if (!h.querySelector('.sd-sec-num')) {
                var num = document.createElement('span');
                num.className = 'sd-sec-num';
                num.textContent = label;
                h.insertBefore(num, h.firstChild);
            }
            if (!h.id) {
                h.id = 'bolum-' + slugify(h.textContent.replace(label, ''), label.replace(/\./g, '-'));
            }
            entries.push({ id: h.id, label: label, text: h.textContent.replace(label, '').trim(), major: isMajor });
        });

        return entries;
    }

    function wrapFigures(body) {
        var images = Array.prototype.slice.call(body.querySelectorAll('img'));

        images.forEach(function (img, i) {
            if (img.closest('.sd-figure')) return;

            var figure = document.createElement('figure');
            figure.className = 'sd-figure';
            figure.id = 'sekil-' + (i + 1);

            var caption = document.createElement('figcaption');
            var strong = document.createElement('strong');
            strong.textContent = 'Şekil ' + (i + 1) + '. ';
            caption.appendChild(strong);
            caption.appendChild(document.createTextNode(img.getAttribute('alt') || 'Kayda ait görsel.'));

            // Gorseli, varsa kendi sarmalayicisindan ayirip figure icine tasi
            img.parentNode.insertBefore(figure, img);
            figure.appendChild(img);
            figure.appendChild(caption);
        });
    }

    function initStickyBar(article) {
        var bar = document.getElementById('sd-sticky-bar');
        var progress = document.getElementById('sd-progress');
        if (!bar) return;

        function update() {
            var rect = article.getBoundingClientRect();
            var passed = rect.top < 0;
            bar.classList.toggle('is-visible', passed && rect.bottom > 220);
            bar.setAttribute('aria-hidden', passed ? 'false' : 'true');

            if (progress) {
                var total = article.offsetHeight - window.innerHeight;
                var done = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
                progress.style.width = (done * 100).toFixed(1) + '%';
            }
        }

        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    function initArticle() {
        var body = document.getElementById('sd-article-body');
        if (!body) return;

        numberSections(body);
        wrapFigures(body);

        var article = document.querySelector('.sd-article');
        if (article) initStickyBar(article);
    }

    /* ---------------------------------------------------------------------
       Baslat
       --------------------------------------------------------------------- */
    function init() {
        initHeaderMenu();
        initCarousel();
        initSuggest();
        initSearchPage();
        initArchiveFilter();
        initCopyShare();
        initArticle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

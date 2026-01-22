// ===============================
// PWA - Service Worker
// ===============================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('✓ Service Worker registrado com sucesso');
            })
            .catch(error => {
                console.log('Service Worker erro:', error);
            });
    });
}

// ===============================
// SISTEMA DE AUDITORIA
// ===============================

let auditLog = JSON.parse(localStorage.getItem("auditLog")) || [];

function addAuditEntry(action, details) {
    const entry = {
        action: action,
        details: details,
        timestamp: new Date().toLocaleString("pt-BR"),
        date: new Date()
    };
    
    auditLog.unshift(entry);
    
    // Manter apenas últimos 500 registros
    if (auditLog.length > 500) {
        auditLog = auditLog.slice(0, 500);
    }
    
    localStorage.setItem("auditLog", JSON.stringify(auditLog));
}

// ===============================
// Pesquisa dinâmica com tags
// ===============================

const searchInput = document.getElementById("searchInput");
let selectedTags = [];

searchInput.addEventListener("keyup", function () {
    const searchText = searchInput.value.toLowerCase();
    filterArticles(searchText, selectedTags);
    
    if (searchText.length > 2) {
        showRelatedArticles(searchText);
    } else {
        document.getElementById("relatedArticles").style.display = "none";
    }
});

// Filtrar artigos por texto e tags
function filterArticles(searchText, tags) {
    const articles = document.querySelectorAll(".article-list li");
    
    articles.forEach(article => {
        const text = article.textContent.toLowerCase();
        const articleTags = article.getAttribute("data-tags")?.split(",") || [];
        
        let matchesSearch = searchText === "" || text.includes(searchText);
        let matchesTags = tags.length === 0 || tags.every(tag => articleTags.includes(tag));
        
        article.style.display = (matchesSearch && matchesTags) ? "block" : "none";
    });
}

// Renderizar tags de filtro
function renderFilterTags() {
    const container = document.getElementById("filterTags");
    container.innerHTML = "";
    
    selectedTags.forEach(tag => {
        const tagEl = document.createElement("span");
        tagEl.className = "filter-tag";
        tagEl.innerHTML = `${tag} <button type="button">✕</button>`;
        tagEl.querySelector("button").addEventListener("click", () => {
            selectedTags = selectedTags.filter(t => t !== tag);
            renderFilterTags();
            filterArticles(searchInput.value.toLowerCase(), selectedTags);
        });
        container.appendChild(tagEl);
    });
}

// Atualizar tags cloud disponíveis
function updateTagsCloud() {
    const allTags = new Set();
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => allTags.add(tag.trim()));
        }
    });
    
    const tagsCloud = document.getElementById("tagsCloud");
    if (tagsCloud) {
        tagsCloud.innerHTML = "";
        allTags.forEach(tag => {
            const tagEl = document.createElement("span");
            tagEl.className = "tag";
            tagEl.textContent = tag;
            tagEl.addEventListener("click", () => {
                if (selectedTags.includes(tag)) {
                    selectedTags = selectedTags.filter(t => t !== tag);
                } else {
                    selectedTags.push(tag);
                }
                renderFilterTags();
                filterArticles(searchInput.value.toLowerCase(), selectedTags);
                tagsCloud.querySelectorAll(".tag").forEach(el => {
                    el.classList.toggle("active", selectedTags.includes(el.textContent));
                });
            });
            tagsCloud.appendChild(tagEl);
        });
    }
}

// ===============================
// Destaque ao passar o mouse
// ===============================

const articles = document.querySelectorAll(".article-list li");

articles.forEach(article => {
    article.addEventListener("mouseenter", () => {
        article.style.backgroundColor = "#f2f6ff";
    });

    article.addEventListener("mouseleave", () => {
        article.style.backgroundColor = "";
    });
});


// ===============================
// Log de acesso (opcional)
// ===============================

const links = document.querySelectorAll(".article-list a");

links.forEach(link => {
    link.addEventListener("click", () => {
        console.log("Artigo acessado:", link.textContent.trim());
    });
});


// ===============================
// SISTEMA DE NOTIFICAÇÕES
// ===============================

function showNotification(message, type = "info", duration = 3000) {
    const container = document.getElementById("notificationContainer");
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    
    const icons = {
        success: "✓",
        error: "✕",
        info: "ℹ",
        warning: "⚠"
    };
    
    notification.innerHTML = `<span>${icons[type]}</span> ${message}`;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add("removing");
        setTimeout(() => notification.remove(), 300);
    }, duration);
}


// ===============================
// MODO ESCURO
// ===============================

const themeToggle = document.getElementById("themeToggle");
const isDarkMode = localStorage.getItem("darkMode") === "true";

if (isDarkMode) {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    showNotification(isDark ? "Modo escuro ativado 🌙" : "Modo claro ativado ☀️", "info", 2000);
});


// ===============================
// ARTIGOS RELACIONADOS
// ===============================

function showRelatedArticles(searchText) {
    const relatedArticles = document.getElementById("relatedArticles");
    const relatedList = document.getElementById("relatedList");
    const allLinks = document.querySelectorAll(".article-list a");
    
    const related = Array.from(allLinks).filter(link => {
        const text = link.textContent.toLowerCase();
        return text.includes(searchText) && text !== searchText;
    });
    
    if (related.length > 0) {
        relatedList.innerHTML = "";
        related.slice(0, 3).forEach(link => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${link.href}" target="_blank">${link.textContent}</a>`;
            relatedList.appendChild(li);
        });
        relatedArticles.style.display = "block";
    } else {
        relatedArticles.style.display = "none";
    }
}


// ===============================
// PAINEL DE ADMINISTRAÇÃO
// ===============================

const adminToggle = document.getElementById("adminToggle");
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");
const adminOverlay = document.getElementById("adminOverlay");
const adminLogin = document.getElementById("adminLogin");
const adminContent = document.getElementById("adminContent");
const loginForm = document.getElementById("loginForm");
const postForm = document.getElementById("postForm");
const shareLink = document.getElementById("shareLink");
const copyLink = document.getElementById("copyLink");
const recentPostsList = document.getElementById("recentPostsList");

// Senha do admin
const ADMIN_PASSWORD = "admin123";

// Array para armazenar postagens (localStorage)
let posts = JSON.parse(localStorage.getItem("basePosts")) || [];
let isLoggedIn = false;

// Abrir painel de administração
adminToggle.addEventListener("click", () => {
    adminPanel.classList.add("active");
    if (isLoggedIn) {
        showAdminContent();
    } else {
        adminLogin.style.display = "block";
        adminContent.style.display = "none";
    }
});

// Login do admin (agora com usuário)
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;
    const users = JSON.parse(localStorage.getItem('kbUsers')) || [];
    const found = users.find(u => u.username === username && u.password === password);

    if (found) {
        isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(found));
        adminLogin.style.display = "none";
        showAdminContent();
        showNotification("✓ Acesso concedido!", "success", 2000);
        document.getElementById("adminPassword").value = "";
        document.getElementById("adminUsername").value = "";
        try { addAuditEntry("login_success", `Login: ${username}`); } catch (e) {}
    } else {
        // fallback: se não houver usuários cadastrados, permitir acesso com ADMIN_PASSWORD
        if ((users.length === 0) && password === ADMIN_PASSWORD) {
            isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify({ username: 'admin', role: 'admin' }));
            adminLogin.style.display = "none";
            showAdminContent();
            showNotification("✓ Acesso concedido (fallback admin)!", "success", 2000);
            document.getElementById("adminPassword").value = "";
            document.getElementById("adminUsername").value = "";
            try { addAuditEntry("login_success", "Fallback admin login"); } catch (e) {}
        } else {
            showNotification("✕ Usuário ou senha incorretos!", "error");
            document.getElementById("adminPassword").value = "";
            try { addAuditEntry("login_failed", `Tentativa de login: ${username}`); } catch (e) {}
        }
    }
});

// Mostrar conteúdo do admin
function showAdminContent() {
    adminContent.style.display = "block";
    updateRecentPosts();
    generateShareLink();
}

// Fechar painel
closeAdmin.addEventListener("click", () => {
    adminPanel.classList.remove("active");
    isLoggedIn = false;
});

adminOverlay.addEventListener("click", () => {
    adminPanel.classList.remove("active");
    isLoggedIn = false;
});

// Gerar link compartilhável
function generateShareLink() {
    const baseUrl = window.location.href.split('?')[0];
    const uuid = Math.random().toString(36).substr(2, 9);
    const expiry = document.getElementById('shareLinkExpiry').value;
    let expiryDate = null;
    
    if (expiry === '24h') {
        expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    } else if (expiry === '7d') {
        expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    // Salvar link com expiração
    let sharedLinks = JSON.parse(localStorage.getItem('sharedLinks')) || [];
    sharedLinks.push({ id: uuid, expiryDate: expiryDate, createdAt: new Date().toISOString() });
    localStorage.setItem('sharedLinks', JSON.stringify(sharedLinks));
    
    const link = `${baseUrl}?access=${uuid}`;
    shareLink.value = link;
}

// Copiar link
copyLink.addEventListener("click", () => {
    shareLink.select();
    document.execCommand("copy");
    const expiry = document.getElementById('shareLinkExpiry').value;
    const expiryText = expiry === '24h' ? ' (expira em 24h)' : (expiry === '7d' ? ' (expira em 7 dias)' : ' (nunca expira)');
    showNotification("Link copiado com sucesso! 📋" + expiryText, "success", 2000);
    try { addAuditEntry("share_link_copy", "Link compartilhável copiado" + expiryText); } catch (e) {}
});

// Gerar link compartilhável (atualizar ao mudar expiração)
document.getElementById('shareLinkExpiry').addEventListener('change', () => {
    generateShareLink();
});


// ===============================
// FUNÇÕES DE POSTAGEM
// ===============================

function incrementViews(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.views = (post.views || 0) + 1;
        localStorage.setItem("basePosts", JSON.stringify(posts));
        // Auditoria: visualização de postagem
        try { addAuditEntry("view_post", `Postagem: ${post.title}`); } catch (e) {}
        // Atualizar estatísticas na UI
        updateRecentPosts();
        updateDashboard();
    }
}

// Deletar postagem
function deletePost(postId) {
    if (confirm("Tem certeza que deseja deletar esta postagem?")) {
        const post = posts.find(p => p.id === postId);
        posts = posts.filter(p => p.id !== postId);
        localStorage.setItem("basePosts", JSON.stringify(posts));
        showNotification("✓ Postagem deletada!", "success");
        try { addAuditEntry("delete_post", `Postagem: ${post ? post.title : postId}`); } catch (e) {}
        setTimeout(() => location.reload(), 700);
    }
}

// Editar postagem
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        document.getElementById("categorySelect").value = post.category;
        document.getElementById("postTitle").value = post.title;
        document.getElementById("postLink").value = post.link;
        document.getElementById("postEmoji").value = post.emoji;
        
        // Scroll para o formulário
        document.querySelector(".post-form").scrollIntoView({ behavior: "smooth" });
        showNotification("💡 Edite os dados e clique em Adicionar", "info");
        
        // Marcar edição iniciada e deletar post antigo (o formulário será usado para recriar)
        try { addAuditEntry("edit_post", `Iniciada edição: ${post.title}`); } catch (e) {}
        // Deletar post antigo (o usuário irá salvar a nova versão)
        deletePost(postId);
    }
}

// Atualizar lista de postagens recentes com ações
function updateRecentPosts() {
    recentPostsList.innerHTML = "";
    
    posts.slice(0, 10).forEach(post => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <strong>${post.emoji} ${post.title}</strong> 
                    <br> 
                    <small>Categoria: ${post.category}</small>
                    <br> 
                    <small>Data: ${post.date}</small>
                    <br>
                    <span class="post-views">👁️ ${post.views || 0} visualizações</span>
                </div>
                <div class="post-actions">
                    <button class="btn-action btn-edit" onclick="editPost(${post.id})">✏️ Editar</button>
                    <button class="btn-action btn-delete" onclick="deletePost(${post.id})">🗑️ Deletar</button>
                </div>
            </div>
        `;
        recentPostsList.appendChild(li);
    });
    
    if (posts.length === 0) {
        recentPostsList.innerHTML = "<li style='color:#999;'>Nenhuma postagem ainda</li>";
    }
}

// Carregar postagens do localStorage ao iniciar
window.addEventListener("load", () => {
    posts.forEach(post => {
        addPostToPage(post);
    });
    updateTagsCloud();
});


// ===============================
// ABAS DO ADMIN
// ===============================

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const tabName = btn.getAttribute("data-tab");
        
        // Remover active de todos
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
        
        // Adicionar active ao clicado
        btn.classList.add("active");
        document.getElementById(`tab-${tabName}`).classList.add("active");
        
        // Atualizar dashboard se necessário
        if (tabName === "dashboard") {
            updateDashboard();
        } else if (tabName === "ferramentas") {
            updateTagsCloud();
        } else if (tabName === "auditoria") {
            renderAuditLog();
        }
    });
});


// ===============================
// DASHBOARD COM ESTATÍSTICAS
// ===============================

function updateDashboard() {
    // Total de postagens
    document.getElementById("totalPosts").textContent = posts.length;
    
    // Total de visualizações
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    document.getElementById("totalViews").textContent = totalViews;
    
    // Média de visualizações
    const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
    document.getElementById("avgViews").textContent = avgViews;
    
    // Top artigos
    const topArticles = document.getElementById("topArticles");
    topArticles.innerHTML = "";
    const sorted = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    sorted.forEach(post => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${post.emoji} ${post.title}</strong> <span>👁️ ${post.views || 0}</span>`;
        topArticles.appendChild(div);
    });
    
    // Estatísticas por categoria
    const categoryStats = document.getElementById("categoryStats");
    categoryStats.innerHTML = "";
    const byCategory = {};
    posts.forEach(post => {
        byCategory[post.category] = (byCategory[post.category] || 0) + 1;
    });
    Object.entries(byCategory).forEach(([cat, count]) => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${cat}</strong> <span>${count} postagens</span>`;
        categoryStats.appendChild(div);
    });
    // Atualizar gráfico de tendências quando o dashboard for exibido
    try { updateTrendsChart(); } catch (e) {}
}


// ===============================
// EXPORT/IMPORT DE DADOS
// ===============================

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify(posts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `base-conhecimentos-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification("✓ Dados exportados com sucesso!", "success");
    try { addAuditEntry("export_data", `Exportou ${posts.length} postagens`); } catch (e) {}
});

importBtn.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedPosts = JSON.parse(event.target.result);
                if (Array.isArray(importedPosts)) {
                    posts = importedPosts;
                    localStorage.setItem("basePosts", JSON.stringify(posts));
                    showNotification("✓ Dados importados! Recarregando...", "success");
                    try { addAuditEntry("import_data", `Importou ${importedPosts.length} postagens`); } catch (e) {}
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification("✕ Arquivo inválido!", "error");
                }
            } catch (err) {
                showNotification("✕ Erro ao ler arquivo!", "error");
            }
        };
        reader.readAsText(file);
    }
});


// ===============================
// AÇÕES PERIGOSAS
// ===============================

const clearAllBtn = document.getElementById("clearAllBtn");

clearAllBtn.addEventListener("click", () => {
    if (confirm("⚠️ Tem certeza? Isso deletará TODAS as postagens!") && 
        confirm("Confirme novamente para deletar TUDO")) {
        posts = [];
        localStorage.setItem("basePosts", JSON.stringify(posts));
        showNotification("✓ Todas as postagens foram deletadas!", "warning");
        try { addAuditEntry("delete_all", "Deletou todas as postagens"); } catch (e) {}
        setTimeout(() => location.reload(), 1500);
    }
});


// ===============================
// GESTÃO DE ACESSOS E RELATÓRIOS (USUÁRIOS + CSV)
// ===============================

// Helpers de usuários
function loadUsers() {
    let users = JSON.parse(localStorage.getItem('kbUsers')) || [];
    // Se não houver usuário, criar fallback admin padrão
    if (users.length === 0) {
        users = [{ id: Date.now(), username: 'admin', password: ADMIN_PASSWORD, role: 'admin' }];
        localStorage.setItem('kbUsers', JSON.stringify(users));
    }
    return users;
}

function saveUsers(users) {
    localStorage.setItem('kbUsers', JSON.stringify(users));
}

function renderUserList() {
    const container = document.getElementById('userList');
    if (!container) return;
    const users = JSON.parse(localStorage.getItem('kbUsers')) || [];
    container.innerHTML = '';
    users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'user-item';
        div.innerHTML = `<strong>${u.username}</strong> <em>(${u.role})</em> <button class="btn-action btn-small" data-id="${u.id}">🗑️ Remover</button>`;
        const btn = div.querySelector('button');
        btn.addEventListener('click', () => {
            if (confirm(`Remover usuário ${u.username}?`)) {
                deleteUser(u.id);
            }
        });
        container.appendChild(div);
    });
}

function addUser(username, password, role) {
    if (!username || !password) { showNotification('Preencha usuário e senha', 'error'); return; }
    const users = JSON.parse(localStorage.getItem('kbUsers')) || [];
    if (users.find(x => x.username === username)) { showNotification('Usuário já existe', 'error'); return; }
    const user = { id: Date.now(), username: username, password: password, role: role };
    users.push(user);
    saveUsers(users);
    renderUserList();
    showNotification('✓ Usuário adicionado', 'success');
    try { addAuditEntry('user_add', `Adicionado ${username} (${role})`); } catch (e) {}
}

function deleteUser(id) {
    let users = JSON.parse(localStorage.getItem('kbUsers')) || [];
    const u = users.find(x => x.id === id);
    users = users.filter(x => x.id !== id);
    saveUsers(users);
    renderUserList();
    showNotification('Usuário removido', 'info');
    try { addAuditEntry('user_delete', `Removido ${u ? u.username : id}`); } catch (e) {}
}

// CSV / Relatórios
function parseBRDateToISO(brDate) {
    // brDate expected dd/mm/yyyy
    if (!brDate) return null;
    const parts = brDate.split('/');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parseInt(parts[1],10)-1, parts[0]);
}

function filterByDateRange(items, dateField, fromStr, toStr) {
    if (!fromStr && !toStr) return items;
    const from = fromStr ? new Date(fromStr + 'T00:00:00') : null;
    const to = toStr ? new Date(toStr + 'T23:59:59') : null;
    return items.filter(it => {
        let dt = null;
        if (dateField === 'post') {
            dt = parseBRDateToISO(it.date);
        } else if (dateField === 'audit') {
            dt = it.date ? new Date(it.date) : (it.timestamp ? new Date(it.timestamp) : null);
        }
        if (!dt) return false;
        if (from && dt < from) return false;
        if (to && dt > to) return false;
        return true;
    });
}

function toCsv(rows, headers) {
    const esc = v => '"' + ('' + (v === undefined || v === null ? '' : v)).replace(/"/g, '""') + '"';
    const lines = [headers.map(esc).join(',')];
    rows.forEach(r => {
        const vals = headers.map(h => r[h] !== undefined ? r[h] : '');
        lines.push(vals.map(esc).join(','));
    });
    return lines.join('\n');
}

function downloadFile(filename, content, mime='text/csv') {
    const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportPostsCsv() {
    const from = document.getElementById('reportFrom').value;
    const to = document.getElementById('reportTo').value;
    const filtered = filterByDateRange(posts, 'post', from, to);
    const rows = filtered.map(p => ({ id: p.id, title: p.title, category: p.category, link: p.link, date: p.date, views: p.views || 0, tags: (p.tags||[]).join(';') }));
    const headers = ['id','title','category','link','date','views','tags'];
    const csv = toCsv(rows, headers);
    downloadFile(`posts-${new Date().toISOString().split('T')[0]}.csv`, csv);
    try { addAuditEntry('export_posts_csv', `Exportou ${rows.length} posts`); } catch (e) {}
}

function exportAuditCsv() {
    const from = document.getElementById('reportFrom').value;
    const to = document.getElementById('reportTo').value;
    const audits = JSON.parse(localStorage.getItem('auditLog')) || [];
    const filtered = filterByDateRange(audits, 'audit', from, to);
    const rows = filtered.map(a => ({ action: a.action, details: a.details, timestamp: a.timestamp }));
    const headers = ['action','details','timestamp'];
    const csv = toCsv(rows, headers);
    downloadFile(`auditoria-${new Date().toISOString().split('T')[0]}.csv`, csv);
    try { addAuditEntry('export_audit_csv', `Exportou ${rows.length} registros de auditoria`); } catch (e) {}
}

// Conectar eventos dos botões de Relatórios e Gestão de Acessos
(function initAccessReports() {
    // Load users if needed and render
    try { loadUsers(); } catch (e) {}
    try { renderUserList(); } catch (e) {}
    try { renderUserStats(); } catch (e) {}
    try { renderSubscriptions(); } catch (e) {}

    const addBtn = document.getElementById('addUserBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const u = document.getElementById('newUsername').value.trim();
            const p = document.getElementById('newUserPassword').value;
            const r = document.getElementById('newUserRole').value;
            addUser(u, p, r);
            document.getElementById('newUsername').value = '';
            document.getElementById('newUserPassword').value = '';
            try { renderUserStats(); } catch (e) {}
        });
    }

    const expPosts = document.getElementById('exportPostsCsv');
    if (expPosts) expPosts.addEventListener('click', exportPostsCsv);
    const expAudit = document.getElementById('exportAuditCsv');
    if (expAudit) expAudit.addEventListener('click', exportAuditCsv);
})();


// ===============================
// BONUS: NOTIFICAÇÕES, EXPIRAÇÃO, STATS
// ===============================

// Subscrições de categorias
function renderSubscriptions() {
    const container = document.getElementById('subscriptionList');
    if (!container) return;
    
    const categories = ['Acessos e Permissões', 'Gestão de Identidades', 'Auditoria e Compliance'];
    let subs = JSON.parse(localStorage.getItem('userSubscriptions')) || {};
    
    container.innerHTML = '';
    categories.forEach(cat => {
        const isSubbed = subs[cat] || false;
        const btn = document.createElement('button');
        btn.className = 'btn-action';
        btn.style.marginRight = '8px';
        btn.textContent = isSubbed ? `✓ ${cat}` : `☐ ${cat}`;
        btn.style.backgroundColor = isSubbed ? '#00bfff' : '#ccc';
        btn.addEventListener('click', () => {
            subs[cat] = !subs[cat];
            localStorage.setItem('userSubscriptions', JSON.stringify(subs));
            renderSubscriptions();
            showNotification(subs[cat] ? `Subscrição ativada: ${cat}` : `Subscrição desativada: ${cat}`, 'info');
        });
        container.appendChild(btn);
    });
}

function triggerCategoryNotification(category, title, emoji) {
    const subs = JSON.parse(localStorage.getItem('userSubscriptions')) || {};
    if (subs[category]) {
        showNotification(`🔔 Novo artigo em ${category}: ${emoji} ${title}`, 'success', 5000);
    }
}

// Estatísticas por usuário
function renderUserStats() {
    const container = document.getElementById('userStats');
    if (!container) return;
    
    const stats = {};
    posts.forEach(p => {
        if (!stats[p.createdBy]) {
            stats[p.createdBy] = { created: 0, edited: 0, views: 0 };
        }
        stats[p.createdBy].created++;
        stats[p.createdBy].views += (p.views || 0);
        if (p.editedBy && p.editedBy.length > 0) {
            stats[p.createdBy].edited += p.editedBy.length;
        }
    });
    
    container.innerHTML = '';
    Object.entries(stats).forEach(([user, data]) => {
        const div = document.createElement('div');
        div.style.padding = '8px';
        div.style.borderLeft = '3px solid #ff1493';
        div.style.marginBottom = '8px';
        div.innerHTML = `<strong>${user}</strong>: ${data.created} posts criados, ${data.edited} edições, ${data.views} visualizações`;
        container.appendChild(div);
    });
    
    if (Object.keys(stats).length === 0) {
        container.innerHTML = '<p style="color:#999;">Nenhum dado de estatísticas</p>';
    }
}

// Verificar expiração de links
function checkLinkExpiry() {
    const params = new URLSearchParams(window.location.search);
    const accessId = params.get('access');
    
    if (accessId) {
        const sharedLinks = JSON.parse(localStorage.getItem('sharedLinks')) || [];
        const link = sharedLinks.find(l => l.id === accessId);
        
        if (link && link.expiryDate) {
            const now = new Date();
            const expiry = new Date(link.expiryDate);
            
            if (now > expiry) {
                showNotification('⏰ Este link de compartilhamento expirou!', 'error', 5000);
                return false;
            }
        }
        return true;
    }
    return true;
}

// Chamar verificação ao carregar
window.addEventListener('load', checkLinkExpiry);


// ===============================
// ADICIONAR TAGS ÀS POSTAGENS
// ===============================

postForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const category = document.getElementById("categorySelect").value;
    const title = document.getElementById("postTitle").value;
    const link = document.getElementById("postLink").value;
    const emoji = document.getElementById("postEmoji").value || "📝";
    const tagsInput = document.getElementById("postTags").value;
    const tags = tagsInput ? tagsInput.split(",").map(t => t.trim().toLowerCase()) : [];
    
    // Validações
    if (!category || !title || !link) {
        showNotification("Por favor, preencha todos os campos obrigatórios!", "error");
        return;
    }
    
    // Criar objeto de postagem
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { username: 'admin' };
    const newPost = {
        id: Date.now(),
        category: category,
        title: title,
        link: link,
        emoji: emoji,
        date: new Date().toLocaleDateString("pt-BR"),
        views: 0,
        tags: tags,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        editedBy: [],
        editedAt: []
    };
    
    // Adicionar à lista
    posts.unshift(newPost);
    
    // Salvar no localStorage
    localStorage.setItem("basePosts", JSON.stringify(posts));
    
    // Adicionar à página
    addPostToPage(newPost);
    
    // Limpar formulário
    postForm.reset();
    
    // Mostrar notificação
    showNotification("✓ Postagem adicionada com sucesso!", "success");
    updateRecentPosts();
    updateTagsCloud();
    
    // Auditoria
    addAuditEntry("create_post", `Postagem: ${title}`);
    
    // Notificações de subscrição
    triggerCategoryNotification(category, title, emoji);
});


// Adicionar postagem à página dinamicamente
function addPostToPage(post) {
    const categoryTitle = post.category;
    let categoryDiv = Array.from(document.querySelectorAll(".category")).find(div => 
        div.querySelector("h2").textContent.includes(categoryTitle.split(" ")[categoryTitle.split(" ").length - 1])
    );
    
    if (categoryDiv) {
        const list = categoryDiv.querySelector(".article-list");
        const newItem = document.createElement("li");
        const tagsAttr = post.tags ? post.tags.join(",") : "";
        newItem.setAttribute("data-tags", tagsAttr);
        newItem.innerHTML = `<a href="${post.link}" target="_blank" data-post-id="${post.id}">${post.emoji} ${post.title}</a>`;
        list.appendChild(newItem);
        
        // Adicionar evento de clique ao novo link
        const a = newItem.querySelector("a");
        a.addEventListener("click", () => {
            incrementViews(post.id);
            console.log("Artigo acessado:", newItem.textContent.trim());
        });
    }
}

let trendsChart = null;

function updateTrendsChart() {
    const ctx = document.getElementById("trendsChart");
    if (!ctx) return;
    
    // Gerar dados dos últimos 7 dias
    const last7Days = [];
    const viewsPerDay = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
        last7Days.push(dateStr);
        viewsPerDay[dateStr] = 0;
    }
    
    // Contar visualizações por dia (simulado)
    const today = new Date().toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    viewsPerDay[today] = totalViews;
    
    const data = {
        labels: last7Days,
        datasets: [{
            label: "Visualizações",
            data: Object.values(viewsPerDay),
            borderColor: "#00bfff",
            backgroundColor: "rgba(0, 191, 255, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#ff1493",
            pointBorderColor: "#00bfff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: document.body.classList.contains("dark-mode") ? "#e0e0e0" : "#333"
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: document.body.classList.contains("dark-mode") ? "#0f3460" : "#f0f0f0"
                },
                ticks: {
                    color: document.body.classList.contains("dark-mode") ? "#aaa" : "#666"
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: document.body.classList.contains("dark-mode") ? "#aaa" : "#666"
                }
            }
        }
    };
    
    if (trendsChart) {
        trendsChart.destroy();
    }
    
    trendsChart = new Chart(ctx, {
        type: "line",
        data: data,
        options: options
    });
}


// ===============================
// LOG DE AUDITORIA UI
// ===============================

function renderAuditLog() {
    const auditLogDiv = document.getElementById("auditLog");
    if (!auditLogDiv) return;
    
    auditLogDiv.innerHTML = "";
    
    auditLog.slice(0, 50).forEach(entry => {
        const div = document.createElement("div");
        div.className = `audit-entry ${entry.action.split("_")[0]}`;
        
        const actionEmoji = {
            "view": "👁️ Visualizado",
            "create": "✎ Criado",
            "edit": "✏️ Editado",
            "delete": "🗑️ Deletado",
            "export": "📥 Exportado",
            "import": "📤 Importado",
            "login": "🔐 Login"
        };
        
        const actionText = actionEmoji[entry.action.split("_")[0]] || entry.action;
        
        div.innerHTML = `
            <div>
                <strong>${actionText}</strong><br>
                <small>${entry.details}</small>
            </div>
            <span class="audit-time">${entry.timestamp}</span>
        `;
        
        auditLogDiv.appendChild(div);
    });
    
    if (auditLog.length === 0) {
        auditLogDiv.innerHTML = "<p style='text-align: center; color: #999;'>Nenhum registro de auditoria</p>";
    }
}

// Botões de auditoria
const clearAuditBtn = document.getElementById("clearAuditBtn");
const exportAuditBtn = document.getElementById("exportAuditBtn");

if (clearAuditBtn) {
    clearAuditBtn.addEventListener("click", () => {
        if (confirm("⚠️ Tem certeza que deseja limpar o log de auditoria?")) {
            auditLog = [];
            localStorage.setItem("auditLog", JSON.stringify(auditLog));
            renderAuditLog();
            showNotification("✓ Log de auditoria limpo!", "warning");
            addAuditEntry("audit_clear", "Log de auditoria limpo");
        }
    });
}

if (exportAuditBtn) {
    exportAuditBtn.addEventListener("click", () => {
        const dataStr = JSON.stringify(auditLog, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `auditoria-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification("✓ Log de auditoria exportado!", "success");
        addAuditEntry("audit_export", "Log exportado");
    });
}

// ===============================
// Pesquisa dinâmica de artigos
// ===============================

const searchInput = document.getElementById("searchInput");
const articles = document.querySelectorAll(".article-list li");

searchInput.addEventListener("keyup", function () {
    const searchText = searchInput.value.toLowerCase();

    articles.forEach(article => {
        const text = article.textContent.toLowerCase();

        if (text.includes(searchText)) {
            article.style.display = "block";
        } else {
            article.style.display = "none";
        }
    });
});


// ===============================
// Destaque ao passar o mouse
// ===============================

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

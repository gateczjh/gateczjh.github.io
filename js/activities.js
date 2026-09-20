document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("[data-activity-search]");
  const posts = Array.from(document.querySelectorAll("[data-post-item]"));
  const count = document.querySelector("[data-search-count]");
  const empty = document.querySelector("[data-no-results]");
  const pagination = document.querySelector("[data-activity-pagination]");
  const pageNumbers = document.querySelector("[data-page-numbers]");
  const prevButton = document.querySelector("[data-page-prev]");
  const nextButton = document.querySelector("[data-page-next]");

  if (!input || posts.length === 0) {
    if (pagination) {
      pagination.style.display = "none";
    }
    return;
  }

  const POSTS_PER_PAGE = 5;
  const lang = pagination?.dataset.paginationLang === "en" ? "en" : "zh";
  let currentPage = 1;

  function normalize(value) {
    return (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFKC")
      .trim();
  }

  function getMatchedPosts() {
    const keyword = normalize(input.value);

    return posts.filter(post => {
      const haystack = normalize(
        [
          post.dataset.title,
          post.dataset.date,
          post.textContent
        ].join(" ")
      );

      return keyword === "" || haystack.includes(keyword);
    });
  }

  function createPageButton(page) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pagination-page";
    button.textContent = page;
    button.dataset.page = page;
    button.setAttribute("aria-label", lang === "en" ? `Page ${page}` : `第 ${page} 頁`);

    if (page === currentPage) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
      currentPage = page;
      render();
      scrollToFeed();
    });

    return button;
  }

  function renderPageNumbers(totalPages) {
    if (!pageNumbers) {
      return;
    }

    pageNumbers.innerHTML = "";

    for (let page = 1; page <= totalPages; page += 1) {
      pageNumbers.appendChild(createPageButton(page));
    }
  }

  function scrollToFeed() {
    const feed = document.querySelector(".activity-feed");
    if (!feed) {
      return;
    }

    const top = feed.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({
      top,
      behavior: "smooth"
    });
  }

  function render() {
    const keyword = normalize(input.value);
    const matchedPosts = getMatchedPosts();
    const totalMatched = matchedPosts.length;
    const totalPages = Math.max(1, Math.ceil(totalMatched / POSTS_PER_PAGE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const start = (currentPage - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const visiblePosts = new Set(matchedPosts.slice(start, end));

    posts.forEach(post => {
      post.style.display = visiblePosts.has(post) ? "" : "none";
    });

    if (count) {
      if (lang === "en") {
        count.textContent = keyword
          ? `${totalMatched} matching post${totalMatched === 1 ? "" : "s"} · Page ${currentPage} of ${totalPages}`
          : `${posts.length} post${posts.length === 1 ? "" : "s"} · Page ${currentPage} of ${totalPages}`;
      } else {
        count.textContent = keyword
          ? `找到 ${totalMatched} 篇文章 · 第 ${currentPage} / ${totalPages} 頁`
          : `共 ${posts.length} 篇文章 · 第 ${currentPage} / ${totalPages} 頁`;
      }
    }

    if (empty) {
      empty.style.display = totalMatched === 0 ? "block" : "none";
    }

    if (pagination) {
      pagination.style.display = totalMatched === 0 || totalPages <= 1 ? "none" : "flex";
    }

    if (totalMatched > 0) {
      renderPageNumbers(totalPages);
    } else if (pageNumbers) {
      pageNumbers.innerHTML = "";
    }

    if (prevButton) {
      prevButton.disabled = currentPage <= 1;
    }

    if (nextButton) {
      nextButton.disabled = currentPage >= totalPages;
    }
  }

  input.addEventListener("input", () => {
    currentPage = 1;
    render();
  });

  prevButton?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      render();
      scrollToFeed();
    }
  });

  nextButton?.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(getMatchedPosts().length / POSTS_PER_PAGE));

    if (currentPage < totalPages) {
      currentPage += 1;
      render();
      scrollToFeed();
    }
  });

  render();
});

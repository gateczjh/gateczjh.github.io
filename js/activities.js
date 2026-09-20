document.addEventListener("DOMContentLoaded", function () {
  var input = document.querySelector("[data-activity-search]");
  var posts = Array.prototype.slice.call(
    document.querySelectorAll("[data-post-item]")
  );
  var count = document.querySelector("[data-search-count]");
  var empty = document.querySelector("[data-no-results]");
  var pagination = document.querySelector("[data-activity-pagination]");
  var pageNumbers = document.querySelector("[data-page-numbers]");
  var prevButton = document.querySelector("[data-page-prev]");
  var nextButton = document.querySelector("[data-page-next]");

  if (!input) {
    return;
  }

  var POSTS_PER_PAGE = 5;
  var currentPage = 1;
  var lang =
    pagination && pagination.getAttribute("data-pagination-lang") === "en"
      ? "en"
      : "zh";

  function normalizeText(value) {
    var text = String(value || "").toLowerCase().trim();

    try {
      text = text.normalize("NFKC");
    } catch (error) {}

    return text;
  }

  function getMatchedPosts() {
    var keyword = normalizeText(input.value);

    return posts.filter(function (post) {
      var title = post.getAttribute("data-title") || "";
      var date = post.getAttribute("data-date") || "";
      var content = post.getAttribute("data-search-content") || "";
      var haystack = normalizeText(title + " " + date + " " + content);

      return keyword === "" || haystack.indexOf(keyword) !== -1;
    });
  }

  function scrollToFeed() {
    var feed = document.querySelector(".activity-feed");
    if (!feed) return;

    var top = feed.getBoundingClientRect().top + window.pageYOffset - 110;

    try {
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch (error) {
      window.scrollTo(0, top);
    }
  }

  function createPageButton(page) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "pagination-page";
    button.textContent = String(page);
    button.setAttribute(
      "aria-label",
      lang === "en" ? "Page " + page : "第 " + page + " 頁"
    );

    if (page === currentPage) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", function () {
      currentPage = page;
      render();
      scrollToFeed();
    });

    return button;
  }

  function renderPageNumbers(totalPages) {
    if (!pageNumbers) return;

    pageNumbers.innerHTML = "";

    for (var page = 1; page <= totalPages; page += 1) {
      pageNumbers.appendChild(createPageButton(page));
    }
  }

  function render() {
    var keyword = normalizeText(input.value);
    var matchedPosts = getMatchedPosts();
    var totalMatched = matchedPosts.length;
    var totalPages = Math.max(1, Math.ceil(totalMatched / POSTS_PER_PAGE));

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    var start = (currentPage - 1) * POSTS_PER_PAGE;
    var end = start + POSTS_PER_PAGE;
    var visiblePosts = matchedPosts.slice(start, end);

    posts.forEach(function (post) {
      post.style.display =
        visiblePosts.indexOf(post) !== -1 ? "" : "none";
    });

    if (count) {
      if (lang === "en") {
        count.textContent = keyword
          ? totalMatched + " matching post" +
            (totalMatched === 1 ? "" : "s") +
            " · Page " + currentPage + " / " + totalPages
          : posts.length + " post" +
            (posts.length === 1 ? "" : "s") +
            " · Page " + currentPage + " / " + totalPages;
      } else {
        count.textContent = keyword
          ? "找到 " + totalMatched + " 篇文章 · 第 " +
            currentPage + " / " + totalPages + " 頁"
          : "共 " + posts.length + " 篇文章 · 第 " +
            currentPage + " / " + totalPages + " 頁";
      }
    }

    if (empty) {
      empty.style.display = totalMatched === 0 ? "block" : "none";
    }

    /* Always keep the pager visible when posts exist.
       If there is only one page, previous/next remain visible but disabled. */
    if (pagination) {
      pagination.style.display = totalMatched === 0 ? "none" : "flex";
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

  function searchNow() {
    currentPage = 1;
    render();
  }

  input.addEventListener("input", searchNow);
  input.addEventListener("search", searchNow);

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage -= 1;
        render();
        scrollToFeed();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      var totalPages = Math.max(
        1,
        Math.ceil(getMatchedPosts().length / POSTS_PER_PAGE)
      );

      if (currentPage < totalPages) {
        currentPage += 1;
        render();
        scrollToFeed();
      }
    });
  }

  render();
});

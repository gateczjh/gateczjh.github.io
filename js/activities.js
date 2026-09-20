
document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector("[data-activity-search]");
  const posts = Array.from(document.querySelectorAll("[data-post-item]"));
  const count = document.querySelector("[data-search-count]");
  const empty = document.querySelector("[data-no-results]");

  if (!input || posts.length === 0) {
    return;
  }

  function normalize(value) {
    return (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFKC")
      .trim();
  }

  function update() {
    const keyword = normalize(input.value);
    let visible = 0;

    posts.forEach(post => {
      const haystack = normalize(
        [
          post.dataset.title,
          post.dataset.date,
          post.textContent
        ].join(" ")
      );

      const matched = keyword === "" || haystack.includes(keyword);

      post.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = keyword
        ? `找到 ${visible} 篇文章`
        : `共 ${posts.length} 篇文章`;
    }

    if (empty) {
      empty.style.display = visible === 0 ? "block" : "none";
    }
  }

  input.addEventListener("input", update);
  update();
});

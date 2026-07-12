const cheerio = require("cheerio");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt({ html: false, linkify: true });

// After rendering markdown to HTML, find runs of two or more consecutive
// "lone image" paragraphs (exactly what a writer gets when they paste several
// photos in a row) and turn each run into a swipeable gallery — reusing the
// same slide-viewer used for presentations. A single photo is left untouched.
function groupConsecutiveImages(html) {
  const $ = cheerio.load(`<div id="_root">${html}</div>`);
  const root = $("#_root");

  function isLoneImageParagraph(node) {
    const $el = $(node);
    return (
      $el.is("p") &&
      $el.children().length === 1 &&
      $el.children("img").length === 1 &&
      $el.clone().children().remove().end().text().trim() === ""
    );
  }

  const children = root.children().toArray();
  let i = 0;
  while (i < children.length) {
    if (!isLoneImageParagraph(children[i])) {
      i++;
      continue;
    }
    // collect the run of consecutive lone-image paragraphs starting here
    let j = i;
    const run = [];
    while (j < children.length && isLoneImageParagraph(children[j])) {
      run.push(children[j]);
      j++;
    }
    if (run.length >= 2) {
      const imgsHtml = run
        .map((node) => $.html($(node).children("img")))
        .join("");
      const gridHtml = `<div class="photo-grid photo-grid-${run.length >= 5 ? "3col" : "2col"}">${imgsHtml}</div>`;
      $(run[0]).before(gridHtml);
      run.forEach((node) => $(node).remove());
    }
    i = j; // move past this whole run (grouped or not) and continue scanning
  }
  return root.html();
}

module.exports = function (eleventyConfig) {
  // Renders the rich-text/markdown magazine content (headings, bold, inline
  // images pasted or dropped into the CMS editor) as real HTML on the page.
  eleventyConfig.addFilter("markdownify", function (str) {
    return groupConsecutiveImages(md.render(str || ""));
  });

  // Formats a date correctly for either language, e.g. "July 11, 2026" or "١١ يوليو ٢٠٢٦"
  eleventyConfig.addFilter("formatDate", function (date, lang) {
    if (!date) return "";
    const locale = lang === "ar" ? "ar" : "en";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));
  });

  // Copy the CMS admin panel and uploaded media straight through to the built site
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/humans.txt": "humans.txt" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });

  // Research collection — newest first
  eleventyConfig.addCollection("research", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/research/*.md")
      .sort((a, b) => (b.data.date || 0) - (a.data.date || 0));
  });

  // Magazine collection — newest first
  eleventyConfig.addCollection("magazine", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/magazine/*.md")
      .sort((a, b) => (b.data.date || 0) - (a.data.date || 0));
  });

  // Bake the English text into every element at build time, so the page
  // is fully readable even before (or without) JavaScript. The language
  // toggle still works exactly as before — it just overwrites this text.
  eleventyConfig.addTransform("bake-english-text", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      const $ = cheerio.load(content);
      $("[data-en]").each(function () {
        const el = $(this);
        if (!el.text().trim() && el.children().length === 0) {
          el.text(el.attr("data-en"));
        }
      });
      $("[data-en-ph]").each(function () {
        const el = $(this);
        if (!el.attr("placeholder")) {
          el.attr("placeholder", el.attr("data-en-ph"));
        }
      });
      return $.html();
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};

const cheerio = require("cheerio");

module.exports = function (eleventyConfig) {
  // Copy the CMS admin panel and uploaded media straight through to the built site
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/humans.txt": "humans.txt" });
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

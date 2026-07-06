module.exports = function (eleventyConfig) {
  // Copy the CMS admin panel and uploaded media straight through to the built site
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });

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

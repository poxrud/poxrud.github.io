module.exports = {
  content: [
    "./_drafts/**/*.html",
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/*.md",
    "./*.md",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        "cool-orange": "#ff813f"
      },
      fill: (theme) => ({
        blue: theme("colors.blue.500")
      })
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

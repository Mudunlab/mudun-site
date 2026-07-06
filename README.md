# Mudun — website

Bilingual (Arabic / English) urban-planning platform for Jordan. Built as a
static site with **Eleventy** and edited through a no-code admin panel
(**Sveltia CMS**). Hosted free on **Cloudflare Pages**.

You do **not** need to touch code to publish. You add and edit pieces at
`/admin` in your browser. This README is here only so that, if anyone ever
needs to understand or change the site, they can.

---

## How publishing works (the everyday workflow)

1. Go to `https://mudunlab.org/admin`
2. Log in with GitHub
3. Pick **Research** or **Magazine**
4. Click **New Research study** / **New Magazine piece**, fill the form,
   attach a cover image and/or PDF, and click **Publish**
5. The site rebuilds itself in about a minute. Your piece is live.

Editing or deleting: open the piece in `/admin`, change it, save — or delete it.

---

## What's in here

```
src/
  index.njk .......... Home page
  about.njk .......... About + Founder's note
  research.njk ....... Research index (lists all research)
  magazine.njk ....... Magazine index (lists all magazine pieces)
  join.njk ........... Membership form
  publish.njk ........ Submission form
  contact.njk ........ Contact details

  research/ .......... One .md file per research study  (edited via /admin)
  magazine/ .......... One .md file per magazine piece   (edited via /admin)
  uploads/ ........... Cover images and PDFs             (uploaded via /admin)

  _includes/
    base.njk ......... Shared shell: header, footer, styles, language toggle
    styles.css ....... All the site's styling (unchanged from the original design)
    entry-card.njk ... The card shown for each piece on the index pages
    layouts/entry.njk  The full page for a single piece

  _data/
    brand.json ....... The two logos (embedded)
    categories.json .. Category names in Arabic + English

  admin/
    index.html ....... Loads the CMS
    config.yml ....... Defines the /admin editor  (one line to edit — see below)
```

Each piece is a small text file with fields like `title_en`, `title_ar`,
`category`, `status`, `brief_en`, `brief_ar`. The CMS reads and writes these
files for you; you never edit them by hand.

---

## One line to set before it works

In `src/admin/config.yml`, change:

```
repo: YOUR-GITHUB-USERNAME/mudun-site
```

to your actual GitHub username and repository name.

---

## Running it on your own computer (optional — not needed to publish)

```
npm install
npm start
```

Then open `http://localhost:8080`. To build the final site: `npm run build`
(output lands in `_site/`). Cloudflare Pages runs `npm run build` for you
automatically on every change, so you normally never do this yourself.

---

## Notes

- **Language:** every page is fully Arabic + English. The toggle in the header
  switches the whole site and remembers your choice.
- **Big files** (video, large datasets): link them from Google Drive or YouTube
  rather than uploading them here.
- **The forms** (Join, Publish) currently show a success message only. They get
  connected to a real inbox (Formspree) as a separate setup step.
```

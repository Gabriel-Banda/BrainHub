<div align="center">
  <h1>🧠 BrainHub</h1>
  <p><strong>Free university study resources for Zambian students</strong></p>
  <p>
    <a href="https://brainhub.pages.dev">🌐 Live Site</a> ·
    <a href="https://brainhub.pages.dev/pages/changelog.html">📋 Changelog</a> ·
    <a href="https://brainhub.pages.dev/pages/contributors.html">👥 Contributors</a>
  </p>
  <img src="https://img.shields.io/badge/version-4.1.0-blue" alt="version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="license">
  <img src="https://img.shields.io/badge/deployed-Cloudflare%20Pages-orange" alt="deployment">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="status">
  <img src="https://img.shields.io/badge/Contributions-Welcome-orange" alt="contributions">
</div>

---

## What is BrainHub?

BrainHub is a free, open-source study platform built specifically for Zambian university students. It provides lecture notes, past papers, interactive quizzes, AI tutoring, and gamified learning — all without requiring a login or paying anything.

**Currently supporting:** CBU · UNZA · ZUT

---

## Features

| Feature | Status |
|---|---|
| 📚 University notes & past papers | ✅ Live |
| 🧠 100-question topic quizzes | ✅ Live |
| 🃏 Interactive flashcard decks | ✅ Live |
| 🤖 AI Tutor (Claude-powered) | ✅ Live |
| 🔐 User accounts (Supabase Auth) | ✅ Live |
| 🏆 XP & gamification system | ✅ Live |
| 💬 Document discussion threads | ✅ Live |
| 🌍 Multi-language (EN/FR/BEM/NYA/TOI) | 🔜 Coming soon |
| 📲 PWA — works offline | ✅ Live |
| 📝 Blog with 9 full articles | ✅ Live |
| 👥 Study groups | 🔜 Coming soon |
| 📤 Community resource uploads | 🔜 Coming soon |

---

## Adding Documents to a Course

Open `src/config.js` — wait, document data lives in `pages/doc.html` inside the `REGISTRY` object.

Find the course entry and add to its `docs` array:

```js
'cbu|bio110|notes': {
  // ...
  docs: [
    {
      id: 1,
      title: 'BIO110 LN 01 – Introduction to Cell Biology',
      type: 'PDF',
      size: '1.2 MB',
      icon: 'fa-file-pdf',
      iconClass: 'pdf',
      url: 'https://pub-*********************859.r2.dev/CBU-DOCS/BIO110/filename.pdf'
    },
  ]
}
```

Link to any doc page using:
```
/pages/doc.html?uni=cbu&course=bio110&type=notes
/pages/doc.html?uni=zut&course=com&type=exams
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS |
| Hosting | Cloudflare Pages |
| Push Notifications | Web Push API + VAPID |
| PWA | Service Worker + Web App Manifest |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [contributors page](https://brainhub.pages.dev/pages/contributors.html).

Content contributions (notes, past papers) are especially welcome — contact us via the [contact page](https://brainhub.pages.dev/pages/contact.html).

---

## License

MIT — free to use, fork, and build on. See [LICENSE](LICENSE).

---

<div align="center">
  <p>Built with ❤️ for Zambian students by <a href="https://github.com/Gabriel-Banda">Gabriel J. Banda</a></p>
  <p><em>Making quality education accessible and free for everyone.</em></p>
</div>

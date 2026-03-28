# Contributing to BrainHub

Thank you for wanting to help make education easy for Zambian students. Every contribution matters.

## Ways to contribute

### 📄 Add study materials (most needed)
The easiest and highest-impact way to contribute. If you have:
- Lecture notes
- Past examination papers
- Past test papers
- Textbook summaries

Upload them to your Google Drive and send us the share link via the [contact page](https://brainhub.pages.dev/pages/contact.html) or email `gabrieljoshuabanda81@gmail.com`. Include:
- University (CBU / UNZA / ZUT)
- Course code and name (e.g. BIO110 Biology)
- Type (Notes / Exams / Tests)
- Year (if exam/test paper)

### 🐛 Report a bug
Open an issue on [GitHub](https://github.com/Gabriel-Banda/BrainHub/issues) with:
- What page you were on
- What you expected to happen
- What actually happened
- Your browser and device

### 💡 Suggest a feature
Open a GitHub issue with the label `enhancement`. Describe the feature and why it would help students.

### 🌍 Improve translations
The i18n JSON files in `/i18n/` contain all translatable strings. If you spot an error in the Ichibemba, Chinyanja, or Chitonga translations, open a PR with the fix.

### 💻 Code contributions
1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test locally (open `index.html` in a browser)
5. Submit a pull request with a clear description

## Code style

- Vanilla JS only — no frameworks or npm packages in `src/`
- CSS follows the existing variable system (`var(--primary)`, `var(--card)` etc)
- All config (URLs, keys) goes in `src/config.js` — not hardcoded
- Functions go in the appropriate file (`gamification.js` for XP logic, `main.js` for UI)
- Comment complex logic

## Project values

BrainHub is built on three principles:
1. **Open** — source code public, contributions welcome
2. **Zambian** — built for and by Zambian students

All contributions must align with these values.

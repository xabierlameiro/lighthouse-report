# Lighthouse Report

A CLI tool that crawls a sitemap and runs [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
performance audits on all discovered pages using [Playwright](https://playwright.dev/).

[![CI](https://github.com/xabierlameiro/lighthouse-report/actions/workflows/ci.yml/badge.svg)](https://github.com/xabierlameiro/lighthouse-report/actions/workflows/ci.yml)

## Features

- 🗺️ Crawls any sitemap URL to discover all pages
- 🏎️ Runs full Lighthouse audits (Performance, Accessibility, Best Practices, SEO)
- 🎭 Uses Playwright for headless browser automation
- 📊 Generates detailed HTML reports per page

## Setup

```bash
npm install
```

## Usage

```bash
node index.js <sitemap-url>
```

Reports are saved to the `reports/` directory.

## License

MIT

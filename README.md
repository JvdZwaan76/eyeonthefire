# Eye on the Fire

## Overview

**Eye on the Fire** is a fire safety and awareness website built to provide real-time fire updates, prevention tips, and community-shared resources. The site aims to empower individuals and communities to stay ahead of wildfires by offering actionable information and a platform to share experiences. It is hosted on Cloudflare Pages and developed with a focus on SEO, mobile responsiveness, and user engagement.

### Pages
- **Home (`index.html`)**: Main landing page with sections for real-time fire updates, prevention tips, and a community hub.
- **About Us (`about.html`)**: Information about Eye on the Fire LLC, including its mission, team, and official recognition by the State of Montana.
- **Recent Fires (`recent-fires.html`)**: A dedicated page showcasing media (photos and videos) from the LA and Pacific Palisades fires of January 2025, along with fire safety tips and community engagement features.

### Features
- Real-time fire updates (placeholder functionality).
- Fire prevention tips with actionable advice.
- Community hub for sharing fire-related photos and videos.
- SEO optimizations (structured data, meta tags, internal/external linking).
- Mobile-responsive design with a fire-themed aesthetic.
- Social sharing buttons to increase engagement.
- Google Analytics integration (via Google Tag Manager).

## Project Structure

## Setup Instructions

### Prerequisites
- A Cloudflare account with Cloudflare Pages set up.
- Git (if deploying via Git).
- A code editor (e.g., VS Code) for making changes.

### Local Development
1. **Clone the Repository** (if using Git):
If you’re not using Git, download the project files and extract them to a local directory.

2. **Open the Project**:
- Open the project folder in your code editor.
- Use a local server to preview the site (e.g., with VS Code’s Live Server extension or by running `python -m http.server` in the project directory).

3. **Make Changes**:
- Edit HTML files (`index.html`, `about.html`, `recent-fires.html`) to update content.
- Modify `styles.css` for styling changes.
- Update `scripts.js` for JavaScript functionality.
- Ensure all media files (images, videos) are placed in the `images` and `videos` folders.

## Deployment

### Deploying to Cloudflare Pages
1. **Using Git**:
- Push changes to your repository:
- Cloudflare Pages will automatically build and deploy the updated site.

2. **Direct Upload**:
- Log in to your Cloudflare account.
- Navigate to **Pages > eyeonthefire > Upload assets**.
- Upload the entire project folder (including `sitemap.xml`, `robots.txt`, `images`, `videos`, etc.).
- Deploy the site.

### Post-Deployment
- **Verify Sitemap**: Submit `sitemap.xml` to Google Search Console:
- Go to [Google Search Console](https://search.google.com/search-console).
- Select your property (`https://eyeonthefire.com/`).
- Navigate to **Sitemaps**, enter `sitemap.xml`, and click **Submit**.
- **Check Google Analytics**: Ensure the Google Tag (`G-T8RE6KDBEW`) is firing (dev tools > Network > `googletagmanager.com`).
- **Test Accessibility**: Open `https://eyeonthefire.com/sitemap.xml` and `https://eyeonthefire.com/robots.txt` in a browser to confirm they’re accessible.

## SEO Optimizations
The site includes several SEO best practices:
- **Structured Data**: Schema markup for `WebPage`, `ImageObject`, `VideoObject`, and `Place` (on `recent-fires.html`).
- **Meta Tags**: Optimized `<title>`, `<meta name="description">`, and `<meta name="keywords">` on all pages.
- **Internal Linking**: Links between pages (e.g., from `recent-fires.html` to `index.html#fires`).
- **External Link-Outs**: Links to authoritative fire safety resources (e.g., Cal Fire, Ready.gov) on `recent-fires.html`.
- **Sitemap**: `sitemap.xml` lists all pages with appropriate `changefreq` and `priority`.
- **Robots**: `robots.txt` allows crawling and points to the sitemap.

## Troubleshooting
- **Sitemap "Couldn't Fetch" Error**:
- Ensure `sitemap.xml` is in the root directory and accessible at `https://eyeonthefire.com/sitemap.xml`.
- Check `robots.txt` to confirm it doesn’t block the sitemap.
- Verify Cloudflare firewall rules aren’t blocking Googlebot.
- Resubmit the sitemap in Google Search Console and wait 24-48 hours.
- **Media Not Displaying**:
- Confirm file paths (e.g., `/images/palisades-fire-highway-smoke.jpg`) match the actual file locations.
- Ensure files are optimized (images <100KB, videos <10MB).
- **Mobile Issues**:
- If content is cramped, adjust padding in `.fires-text` or `.media-item` in `styles.css`.
- Clear browser cache (`Ctrl+Shift+R`) and retest.

## Contributing
To contribute to this project:
1. Fork the repository (if using Git).
2. Create a new branch (`git checkout -b feature/new-content`).
3. Make changes and test locally.
4. Commit changes (`git commit -m "Added new fire safety tips"`).
5. Push to your fork (`git push origin feature/new-content`).
6. Create a pull request to the main repository.

## Contact
For questions or support, reach out to `info@eyeonthefire.com` or visit our [Community Hub](https://eyeonthefire.com/#community).

---

**Last Updated**: March 25, 2025
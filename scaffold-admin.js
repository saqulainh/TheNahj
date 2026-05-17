const fs = require('fs');
const path = require('path');

const routes = [
  { path: 'homepage', title: 'Homepage Management' },
  { path: 'wisdom-cards', title: 'Wisdom Cards CMS' },
  { path: 'imam-ali-says', title: 'Imam Ali Says' },
  { path: 'student-corner', title: 'Student Corner' },
  { path: 'youth-corner', title: 'Youth Corner' },
  { path: 'nahjul-balagha', title: 'Nahjul Balagha' },
  { path: 'topics', title: 'Topics' },
  { path: 'articles', title: 'Articles' },
  { path: 'audio-reflections', title: 'Audio Reflections' },
  { path: 'collections', title: 'Collections' },
  { path: 'categories', title: 'Categories' },
  { path: 'media-library', title: 'Media Library' },
  { path: 'seo-manager', title: 'SEO Manager' },
  { path: 'navigation', title: 'Navigation Menu' },
  { path: 'users', title: 'Users' },
  { path: 'settings', title: 'Settings' }
];

const basePath = path.join(__dirname, 'src', 'app', 'admin');

routes.forEach(route => {
  const dirPath = path.join(basePath, route.path);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const pagePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    const content = `export default function ${route.path.replace(/-/g, '').replace(/^(.)/, c => c.toUpperCase())}Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">${route.title}</h1>
        <p className="mt-2 text-sm text-muted">Manage your ${route.title.toLowerCase()} content here.</p>
      </div>
      
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
        <p>This module is under construction.</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(pagePath, content);
  }
});

console.log('Admin pages scaffolded!');

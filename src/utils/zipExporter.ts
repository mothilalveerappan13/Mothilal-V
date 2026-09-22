import JSZip from 'jszip';

// Vite provides raw source code importing via glob
const projectFiles = import.meta.glob(
  [
    '/src/**/*',
    '/index.html',
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/metadata.json',
    '/README.md',
    '/inventory_system.c',
  ],
  { query: '?raw', import: 'default', eager: true }
);

export async function exportProjectAsZip(): Promise<void> {
  const zip = new JSZip();

  // Add all project files into zip
  for (const [filepath, content] of Object.entries(projectFiles)) {
    // Strip leading slash
    const cleanPath = filepath.replace(/^\//, '');
    if (typeof content === 'string') {
      zip.file(cleanPath, content);
    }
  }

  // Generate binary zip file
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Trigger download in browser
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'inventory-management-system.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

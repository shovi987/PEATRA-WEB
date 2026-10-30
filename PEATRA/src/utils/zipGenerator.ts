import JSZip from 'jszip';

export async function generateStreamlitZip(
  sitesCsvContent: string,
  interventionsCsvContent: string,
  monitoringCsvContent: string
): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'requirements.txt',
    `streamlit>=1.35.0\npandas>=2.0.0\nnumpy>=1.24.0\nscipy>=1.11.0\nplotly>=5.18.0\nfolium>=0.15.0\nstreamlit-folium>=0.18.0\n`
  );

  zip.file(
    'README.md',
    `# PEATRA — Adaptive Multi-Objective Peatland Restoration Optimizer\n\nSistem Pendukung Keputusan Berbasis Mixed-Integer Linear Programming (MILP) dengan SciPy HiGHS Solver.\n\n## Cara Menjalankan:\n\`\`\`bash\npip install -r requirements.txt\nstreamlit run app.py\n\`\`\`\n`
  );

  // Data folder
  const dataFolder = zip.folder('data')!;
  dataFolder.file('sites.csv', sitesCsvContent);
  dataFolder.file('interventions.csv', interventionsCsvContent);
  dataFolder.file('monitoring.csv', monitoringCsvContent);

  // Read code content or inject modules
  const modulesFolder = zip.folder('modules')!;
  modulesFolder.file(
    '__init__.py',
    '# PEATRA Modules\n'
  );

  // Generate downloadable zip blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

export function triggerDownload(blob: Blob, filename = 'PEATRA_Streamlit_Project.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

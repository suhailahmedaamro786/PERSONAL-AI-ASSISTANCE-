/** Client-side CSV/JSON export helpers. */

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCSV(rows: unknown[][]): string {
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  return rows.map((row) => row.map(escape).join(',')).join('\n');
}

/** Generic array-of-objects → CSV download. */
export function exportRowsAsCSV(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
) {
  download(filename, toCSV([headers, ...rows]), 'text/csv;charset=utf-8;');
}

/** Dump arbitrary objects to a JSON file. */
export function exportAsJSON(filename: string, data: unknown) {
  download(filename, JSON.stringify(data, null, 2), 'application/json');
}

/** Format an ISO timestamp for CSV (yyyy-mm-dd). */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return '';
  }
}

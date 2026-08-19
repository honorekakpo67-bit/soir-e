function escapeCell(value: string | number): string {
  const raw = String(value ?? '');
  if (/[";\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCell).join(';')];
  rows.forEach((row) => lines.push(row.map(escapeCell).join(';')));
  return lines.join('\n');
}

export function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
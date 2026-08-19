import qrcode from 'qrcode-generator';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomBlock(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateTicketCode(): string {
  return `JGM-${randomBlock(4)}-${randomBlock(4)}`;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${randomBlock(4).toLowerCase()}`;
}

export async function ticketQrDataUrl(code: string, size = 1024): Promise<string> {
  const qr = qrcode(0, 'H');
  qr.addData(code);
  qr.make();

  const modules = qr.getModuleCount();
  const margin = 4;
  const cell = Math.max(2, Math.floor(size / (modules + margin * 2)));
  const canvasSize = cell * (modules + margin * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const context = canvas.getContext('2d');
  if (!context) return '';

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.fillStyle = '#150a26';
  for (let row = 0; row < modules; row += 1) {
    for (let col = 0; col < modules; col += 1) {
      if (qr.isDark(row, col)) {
        context.fillRect((col + margin) * cell, (row + margin) * cell, cell, cell);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
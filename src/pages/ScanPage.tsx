import { useSearchParams } from 'react-router-dom';
import { PublicLayout } from '../components/public/PublicLayout';
import { QRScanner } from '../components/QRScanner';

export function ScanPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId') || '';

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <QRScanner eventId={eventId} />
      </div>
    </PublicLayout>
  );
}
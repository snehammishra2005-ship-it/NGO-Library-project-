import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
      <div>
        <p className="font-serif text-7xl text-ink-900">404</p>
        <p className="mt-4 text-lg text-ink-500">This page has been returned to the shelf.</p>
        <Link to="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </div>
  );
}

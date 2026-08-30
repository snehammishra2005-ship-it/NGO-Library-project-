import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-200 bg-paper-pure">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h4 className="font-serif text-lg text-ink-900">The Reading Room</h4>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
            A neighbourhood library. Browse the catalogue online, then come read
            with us in person.
          </p>
        </div>
        <div>
          <p className="label">Visit</p>
          <address className="mt-2 space-y-1 text-sm not-italic text-ink-600">
            <p>14 Lamplight Lane</p>
            <p>Fort District, Mumbai 400001</p>
            <p>hello@readingroom.test</p>
            <p>+91 22 4000 0000</p>
          </address>
        </div>
        <div>
          <p className="label">Hours</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-600">
            <li>Mon–Fri · 9:00 – 20:00</li>
            <li>Saturday · 10:00 – 18:00</li>
            <li>Sunday · Closed</li>
          </ul>
        </div>
        <div>
          <p className="label">Explore</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link to="/catalog" className="text-ink-600 hover:text-ink-900">Catalogue</Link></li>
            <li><Link to="/about" className="text-ink-600 hover:text-ink-900">About &amp; hours</Link></li>
            <li><Link to="/signup" className="text-ink-600 hover:text-ink-900">Become a member</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} The Reading Room. Discovery only — borrowing happens in person.</p>
          <div className="flex gap-4">
            <span className="hover:text-ink-700">Instagram</span>
            <span className="hover:text-ink-700">Twitter</span>
            <span className="hover:text-ink-700">Newsletter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

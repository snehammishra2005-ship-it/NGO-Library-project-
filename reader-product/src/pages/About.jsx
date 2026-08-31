export default function About() {
  return (
    <div className="container-x py-12">
      <div className="max-w-3xl">
        <h1 className="rule-under font-serif text-4xl text-ink-900">About the library</h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-600">
          The Reading Room is a small community library in the heart of the Fort
          District. We’ve kept the same promise since 1974: a quiet, well-lit
          place to find a good book. This website exists so you can check what’s
          on our shelves before you make the trip — but the reading, and the
          borrowing, always happen in person.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-serif text-xl text-ink-900">Hours</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li className="flex justify-between"><span>Mon – Fri</span><span className="text-ink-900">9:00 – 20:00</span></li>
            <li className="flex justify-between"><span>Saturday</span><span className="text-ink-900">10:00 – 18:00</span></li>
            <li className="flex justify-between"><span>Sunday</span><span className="text-ink-400">Closed</span></li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="font-serif text-xl text-ink-900">Visit</h2>
          <address className="mt-4 space-y-1 text-sm not-italic text-ink-600">
            <p>14 Lamplight Lane</p>
            <p>Fort District</p>
            <p>Mumbai 400001</p>
          </address>
        </div>
        <div className="card p-6">
          <h2 className="font-serif text-xl text-ink-900">Contact</h2>
          <ul className="mt-4 space-y-1 text-sm text-ink-600">
            <li>hello@readingroom.test</li>
            <li>+91 22 4000 0000</li>
            <li>Instagram · @readingroom</li>
          </ul>
        </div>
      </div>

      {/* Grayscale map placeholder — no color, per the B&W constraint. */}
      <div className="card mt-8 overflow-hidden">
        <div
          className="grid h-64 place-items-center"
          style={{
            backgroundColor: '#E8E8E8',
            backgroundImage:
              'linear-gradient(#D6D6D6 1px, transparent 1px), linear-gradient(90deg, #D6D6D6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm text-paper-pure shadow-card">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-paper-pure ring-4 ring-paper-pure/30" />
            The Reading Room · 14 Lamplight Lane
          </div>
        </div>
      </div>
    </div>
  );
}

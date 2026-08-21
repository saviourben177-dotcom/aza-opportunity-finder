import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
        <Compass size={23} className="text-[hsl(var(--primary))]" />
      </div>
      <h1 className="mt-6 font-display text-4xl">That page isn’t on the map.</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        The link may be out of date, or the page may have moved. Head back and start a fresh brief.
      </p>
      <Link
        href="/"
        data-testid="link-notfound-home"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"
      >
        <ArrowLeft size={15} /> Back to Aza
      </Link>
    </main>
  );
}

export function PageHead({ title, body }: { title: string; body?: string }) {
  return (
    <header className="relative isolate px-5 pb-10 pt-36 md:px-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold tracking-tight md:text-7xl [html[lang=ar]_&]:leading-[1.2] [html[lang=ar]_&]:tracking-normal">{title}</h1>
        {body && <p className="mt-5 max-w-2xl text-lg text-muted">{body}</p>}
      </div>
    </header>
  );
}

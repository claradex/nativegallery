export default function Loading() {
  return <div aria-busy="true" aria-label="Загрузка" className="animate-pulse">
    <div className="mb-3 h-8 w-56 rounded-md bg-muted" />
    <div className="mb-8 h-4 w-80 max-w-full rounded bg-muted" />
    <div className="grid gap-3">{[0, 1, 2, 3].map(index => <div key={index} className="h-16 rounded-xl bg-muted/70" />)}</div>
  </div>;
}

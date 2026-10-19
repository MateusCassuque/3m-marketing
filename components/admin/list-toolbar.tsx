import Link from "next/link";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

/** Campo de pesquisa que funciona por URL (?q=), reinicia a paginação e não precisa de JavaScript. */
export function SearchForm({
  q,
  placeholder,
  basePath,
  hidden = {},
}: {
  q: string;
  placeholder: string;
  basePath: string;
  /** Parâmetros a manter ao pesquisar (ex.: o filtro de estado). */
  hidden?: Record<string, string | undefined>;
}) {
  const keep = Object.entries(hidden).filter(([, v]) => v) as [string, string][];
  const clearHref = (() => {
    const search = new URLSearchParams(keep);
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  })();
  return (
    <form method="GET" action={basePath} className="relative w-full sm:max-w-sm" role="search">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {keep.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Input name="q" defaultValue={q} placeholder={placeholder} className="pl-9 pr-10" aria-label={placeholder} />
      {q && (
        <Link
          href={clearHref}
          aria-label="Limpar pesquisa"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-navy-50 hover:text-navy-700"
        >
          <X className="h-4 w-4" />
        </Link>
      )}
    </form>
  );
}

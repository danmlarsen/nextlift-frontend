import { usePathname, useSearchParams } from "next/navigation";

/**
 * Boolean UI state (e.g. whether a modal is open) mirrored into a
 * `?<name>=open` search param, so the browser's back button closes it.
 *
 * Writes go through the History API rather than `router.push/replace`. The
 * App Router syncs both with `useSearchParams`, but a router navigation is a
 * server round trip: closing a modal on a flaky or suspended connection (a
 * phone in the background) would keep it open until the request came back.
 * History updates apply synchronously and work offline.
 */
export function useSearchParamState(paramName: string) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const value = searchParams.get(paramName) === "open";

  const setValue = (open: boolean) => {
    if (open === value) return;

    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set(paramName, "open");
    } else {
      params.delete(paramName);
    }
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    if (open) {
      window.history.pushState(null, "", url);
    } else {
      window.history.replaceState(null, "", url);
    }
  };

  return [value, setValue] as const;
}

"use client";

import NextLink from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import {
  type AnchorHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type NavigateOptions = {
  replace?: boolean;
};

type SearchParamsInit =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>
  | [string, string][];

type To =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
    };

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: To;
  replace?: boolean;
  children: ReactNode;
};

const toHref = (to: To): string => {
  if (typeof to === "string") return to;

  const pathname = to.pathname ?? "";
  const search = to.search ?? "";
  const hash = to.hash ?? "";

  return `${pathname}${search}${hash}` || "/";
};

const toSearchParams = (value: SearchParamsInit): URLSearchParams => {
  if (value instanceof URLSearchParams) return new URLSearchParams(value);
  if (typeof value === "string") return new URLSearchParams(value);
  if (Array.isArray(value)) return new URLSearchParams(value);

  const next = new URLSearchParams();
  Object.entries(value).forEach(([key, raw]) => {
    if (raw === undefined || raw === null) return;
    next.set(key, String(raw));
  });
  return next;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, children, ...rest }, ref) => {
    return (
      <NextLink ref={ref} href={toHref(to)} replace={replace} {...rest}>
        {children}
      </NextLink>
    );
  },
);

Link.displayName = "RouterLink";

export const useNavigate = () => {
  const router = useRouter();

  return useCallback(
    (to: string, options?: NavigateOptions) => {
      if (options?.replace) {
        router.replace(to);
        return;
      }
      router.push(to);
    },
    [router],
  );
};

export const useLocation = () => {
  const pathname = usePathname() ?? "/";
  const nextSearchParams = useNextSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncHash = () => setHash(window.location.hash || "");
    syncHash();

    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const search = useMemo(() => {
    const qs = nextSearchParams.toString();
    return qs ? `?${qs}` : "";
  }, [nextSearchParams]);

  return useMemo(
    () => ({ pathname, search, hash }),
    [pathname, search, hash],
  );
};

export const useSearchParams = (): [
  URLSearchParams,
  (next: SearchParamsInit, options?: NavigateOptions) => void,
] => {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const nextSearchParams = useNextSearchParams();

  const current = useMemo(
    () => new URLSearchParams(nextSearchParams.toString()),
    [nextSearchParams],
  );

  const setSearchParams = useCallback(
    (next: SearchParamsInit, options?: NavigateOptions) => {
      const params = toSearchParams(next);
      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;

      if (options?.replace) {
        router.replace(href);
        return;
      }
      router.push(href);
    },
    [pathname, router],
  );

  return [current, setSearchParams];
};

export const useParams = <
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
>() => {
  return useNextParams<T>();
};

type NavLinkProps = Omit<LinkProps, "className"> & {
  className?: string | ((state: { isActive: boolean }) => string) | undefined;
  end?: boolean;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, to, end, ...rest }, ref) => {
    const pathname = usePathname() ?? "/";
    const href = toHref(to);
    const hrefPath = href.split(/[?#]/)[0] || "/";
    const isActive = end
      ? pathname === hrefPath
      : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);

    const resolvedClassName =
      typeof className === "function" ? className({ isActive }) : className;

    return (
      <Link
        ref={ref}
        to={to}
        className={resolvedClassName}
        aria-current={isActive ? "page" : undefined}
        {...rest}
      />
    );
  },
);

NavLink.displayName = "RouterNavLink";


import { Fragment, Suspense, useEffect, useState, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowRightLeft,
  BarChart3,
  CalendarClock,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Lightbulb,
  Mail,
  MessageSquareQuote,
  Moon,
  Sun,
  Users,
} from 'lucide-react';

import { gsap, useGSAP } from '@/lib/gsap';
import { usePageTransition } from '@/hooks/usePageTransition';
import { usePocData } from '@/hooks/usePocData';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: '/timeline', label: 'Timeline', icon: CalendarClock },
  { to: '/kpi', label: 'KPI', icon: BarChart3 },
  { to: '/metiers', label: 'Métiers', icon: Users },
  { to: '/avant-apres', label: 'Avant / Après', icon: ArrowRightLeft },
  { to: '/cas-usage', label: "Cas d'usage", icon: Lightbulb },
  { to: '/rex-interne', label: 'REX interne', icon: ClipboardList, end: true },
  { to: '/rex', label: 'REX externe', icon: MessageSquareQuote, end: true },
];

type Theme = 'light' | 'dark';

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('six-theme') as Theme) || 'light',
  );
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('six-theme', theme);
    window.dispatchEvent(new Event('themechange'));
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))];
}

interface Crumb {
  label: string;
  to?: string;
}

/** Construit le fil d'Ariane à partir de la route (nom de métier résolu via les données). */
function buildCrumbs(
  pathname: string,
  metierNom: (slug: string) => string,
  rexTitre: (id: string) => string,
): Crumb[] {
  if (pathname === '/') return [{ label: "Vue d'ensemble" }];

  const segs = pathname.split('/').filter(Boolean);
  const sectionPath = `/${segs[0]}`;
  const sectionLabel = NAV.find((n) => n.to === sectionPath)?.label ?? segs[0];
  const crumbs: Crumb[] = [{ label: 'Accueil', to: '/' }];

  if (segs.length === 1) {
    crumbs.push({ label: sectionLabel });
    return crumbs;
  }

  crumbs.push({ label: sectionLabel, to: sectionPath });
  const leaf =
    segs[0] === 'metiers'
      ? metierNom(segs[1])
      : segs[0] === 'rex'
        ? rexTitre(segs[1])
        : segs[1];
  crumbs.push({ label: leaf });
  return crumbs;
}

function AppSidebar() {
  const { pathname } = useLocation();

  // Entrée échelonnée des entrées de nav (desktop, hors reduced-motion).
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.from('[data-nav-item]', {
        x: -12,
        autoAlpha: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.05,
        delay: 0.05,
      });
    });
    return () => mm.revert();
  }, {});

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/">
                <span className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-white">
                  SIX
                </span>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">POC&nbsp;Claude</span>
                  <span className="truncate text-xs text-muted-foreground">Suivi d'équipe</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to} data-nav-item>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <NavLink to={item.to} end={item.end}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Contact">
              <a href="mailto:ludovic.dewet@axa.fr">
                <Mail className="size-4" />
                <span>Contact</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="flex items-center justify-center gap-1 px-2 pt-1 pb-1 text-[0.68rem] text-muted-foreground group-data-[collapsible=icon]:hidden">
          Made with <Heart className="size-3 fill-primary text-primary" /> by SIX
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// Affiché pendant le téléchargement du chunk d'une page (code-splitting). Repris du
// squelette de DataGate pour une transition cohérente avant que la donnée ne charge.
function PageFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement de la page">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function Layout() {
  const [theme, toggleTheme] = useTheme();
  const { pathname } = useLocation();
  const { data } = usePocData();
  const mainRef = usePageTransition<HTMLElement>(pathname);

  const metierNom = (slug: string) =>
    data?.metiers.find((m) => m.slug === slug)?.nom ?? slug.toUpperCase();
  const rexTitre = (id: string) => data?.rex.find((r) => r.id === id)?.titre ?? id;
  const crumbs = buildCrumbs(pathname, metierNom, rexTitre);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-5" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((c, i) => (
                <Fragment key={`${c.label}-${i}`}>
                  <BreadcrumbItem>
                    {c.to ? (
                      <BreadcrumbLink asChild>
                        <NavLink to={c.to}>{c.label}</NavLink>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {i < crumbs.length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Basculer le thème"
              title="Basculer le thème"
            >
              {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
          </div>
        </header>

        <main ref={mainRef} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

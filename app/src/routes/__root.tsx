import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { useSync } from "../hooks/useSync";
import { useBoot } from "../hooks/useBoot";
import { params } from "./employees";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : React.lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        }))
      );

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const isBooted = useBoot();
  const isSyncing = useSync();

  // if (!isSyncing) {
  //   return (
  //     <div className="max-w-screen max-h-screen w-screen h-screen flex justify-center items-center">
  //       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //       <div>Loading</div>
  //     </div>
  //   );
  // }

  return (
    <>
      <Container>
        <NavBar />
        <Outlet />
      </Container>
      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </>
  );
}

function NavBar() {
  return (
    <div className="p-2 flex gap-2 text-lg border-b">
      <Button variant="outline" asChild={true}>
        <Link
          to="/"
          activeProps={{
            className: "bg-slate-100",
          }}
        >
          Home
        </Link>
      </Button>

      <Button variant="outline" asChild={true}>
        <Link
          to={"/employees"}
          search={params.safeParse({}).data!}
          activeProps={{
            className: "bg-slate-100",
          }}
        >
          Employees
        </Link>
      </Button>
      <Button variant="outline" asChild={true}>
        <Link
          to={"/about"}
          activeProps={{
            className: "bg-slate-100",
          }}
        >
          About
        </Link>
      </Button>
    </div>
  );
}

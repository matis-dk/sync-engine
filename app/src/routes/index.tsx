import * as React from "react";
import {
  createFileRoute,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const context = useRouteContext({ from: "/" });
  console.log("context ====> ", context);

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}

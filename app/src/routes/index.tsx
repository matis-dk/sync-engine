import * as React from "react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import axios from "axios";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const context = useRouteContext({ from: "/" });
  console.log("context ====> ", context);

  const handleReconnect = () => {
    axios.get("");
  };

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      <button onClick={handleReconnect}>Sync (/api/sync/reconnect)</button>
    </div>
  );
}

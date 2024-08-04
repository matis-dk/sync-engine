import { useStore } from "@/services/store/store-service";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/employee-detail")({
  component: EmployeeDetail,
  validateSearch: (search: Record<string, unknown>): { id?: string } => {
    if (search.id && typeof search.id === "string") {
      return { id: search.id };
    } else {
      return {};
    }
  },
});

function EmployeeDetail({ props }: any) {
  const s = Route.useSearch();
  const employees = useStore().employees;
  const employee = s.id ? employees[s.id] || null : null;

  if (!employee) {
    return (
      <div className="p-2">
        <h3>Employee not found</h3>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2>Details</h2>
      <pre>{JSON.stringify(employee, null, 2)}</pre>
    </div>
  );
}

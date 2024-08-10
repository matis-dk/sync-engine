import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { useStore } from "@/services/store/store-service";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/employees-list")({
  component: EmployeesList,
});

function EmployeesList() {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex max-w-[1200px] w-full justify-end ">
        <Button onClick={() => router.navigate({ to: "/employee-detail" })}>
          Add employee
        </Button>
      </div>
      <EmployeesTable />
    </div>
  );
}

type SortKeys = "Name" | "Email" | "Phone" | "Updated" | "Deleted";
type SortOrder = "asc" | "desc";

function EmployeesTable() {
  const router = useRouter();
  const employees = useStore().employees;
  const data = Object.values(employees);

  const [sortKey, setSortKey] = useState<SortKeys>("Name");
  const [order, setOrder] = useState<SortOrder>("asc");
  const handleSort = (key: SortKeys) => {
    if (sortKey === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    }
    setSortKey(key);
  };

  const sortedItems = useMemo(() => {
    const pos = order === "asc" ? 1 : -1;
    const neg = order === "asc" ? -1 : 1;

    if (sortKey === "Name") {
      return data.sort((a, b) => (a.first_name > b.first_name ? pos : neg));
    }

    if (sortKey === "Email") {
      return data.sort((a, b) => (a.email > b.email ? pos : neg));
    }

    if (sortKey === "Phone") {
      return data.sort((a, b) => (a.phone_number > b.phone_number ? pos : neg));
    }

    if (sortKey === "Updated") {
      return data.sort((a, b) =>
        new Date(a.updated_at).getTime() > new Date(b.updated_at).getTime()
          ? pos
          : neg
      );
    }

    if (sortKey === "Deleted") {
      return data.sort((a, b) =>
        Boolean(a.deleted_at) > Boolean(b.deleted_at) ? pos : neg
      );
    }

    return data;
  }, [data, sortKey, order]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-4 w-[1200px] border pb-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("Name")}
            >
              Name
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("Email")}
            >
              Email
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("Phone")}
            >
              Phone
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("Updated")}
            >
              Updated At
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("Deleted")}
            >
              Deleted
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                router.navigate({
                  to: "/employee-detail",
                  search: { id: item.id },
                });
              }}
            >
              <TableCell>
                {item.first_name} {item.last_name}
              </TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.phone_number}</TableCell>
              <TableCell>{item.updated_at}</TableCell>
              <TableCell>{item.deleted_at ? "yes" : "no"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => handlePageChange(currentPage)}
              isActive={true}
            >
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

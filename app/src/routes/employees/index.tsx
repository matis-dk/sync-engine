import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
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
import { z } from "zod";
import Fuse from "fuse.js";

const sortOrder = z.union([z.literal("asc"), z.literal("desc")]);
const sortKeys = z.union([
  z.literal("Name"),
  z.literal("Email"),
  z.literal("Phone"),
  z.literal("Updated"),
  z.literal("Deleted"),
]);

export const params = z.object({
  sort: sortKeys.optional().default("Name").catch("Name"),
  order: sortOrder.optional().default("asc").catch("asc"),
  show_deleted: z.boolean().optional().default(false).catch(false),
  q: z
    .string()
    .optional()
    .refine((res) => res || "")
    .catch(""),
});

type SortKeys = z.infer<typeof sortKeys>;
type SortOrder = z.infer<typeof sortOrder>;
type Params = z.infer<typeof params>;

export const Route = createFileRoute("/employees/")({
  component: EmployeesList,
  validateSearch: params,
});

function EmployeesList() {
  return (
    <>
      <Toolbar />
      <EmployeesTable />
    </>
  );
}

// transformation: raw data --> filteredData  --> sortedData --> slicedData
function EmployeesTable() {
  const navigate = useNavigate({ from: Route.fullPath });
  const search = useSearch({ from: "/employees/" });

  const employees = useStore().employees;
  const data = Object.values(employees);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const filteredData = useMemo(() => {
    const filteredByDeleted = search.show_deleted
      ? data
      : data.filter((i) => !Boolean(i.deleted_at));

    const filteredBySearch =
      !search.q || search.q.length < 2
        ? filteredByDeleted
        : new Fuse(filteredByDeleted, {
            minMatchCharLength: 2,
            threshold: 0.15,
            shouldSort: true,
            includeScore: true,
            keys: ["first_name", "last_name", "email"],
          })
            .search(search.q)
            .map((i) => i.item);

    return filteredBySearch;
  }, [data, search.q, search.show_deleted]);

  const sortedData = useMemo(() => {
    const list = filteredData;
    const pos = search.order === "asc" ? 1 : -1;
    const neg = search.order === "asc" ? -1 : 1;

    if (search.sort === "Name") {
      return list.sort((a, b) => (a.first_name > b.first_name ? pos : neg));
    }

    if (search.sort === "Email") {
      return list.sort((a, b) => (a.email > b.email ? pos : neg));
    }

    if (search.sort === "Phone") {
      return list.sort((a, b) => (a.phone_number > b.phone_number ? pos : neg));
    }

    if (search.sort === "Updated") {
      return list.sort((a, b) =>
        isoToTime(a.updated_at) > isoToTime(b.updated_at) ? pos : neg
      );
    }

    if (search.sort === "Deleted") {
      return list.sort((a, b) =>
        Boolean(a.deleted_at) > Boolean(b.deleted_at) ? pos : neg
      );
    }

    return list;
  }, [filteredData, search.sort, search.order]);

  const slicedData = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: SortKeys) => {
    navigate({
      replace: true,
      search: (prev) => ({
        ...prev,
        sort: key,
        order: search.order === "asc" ? "desc" : "asc",
      }),
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full  pb-4">
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
          {slicedData.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                navigate({
                  to: "/employees/$employee-id",
                  params: {
                    "employee-id": item.id,
                  },
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
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

function Toolbar() {
  const navigate = useNavigate({ from: "/employees" });
  const search = useSearch({ from: "/employees/" });

  const handleChange = (params: Partial<Params>) => {
    navigate({
      replace: true,
      search: (prev) => ({
        ...prev,
        ...params,
      }),
    });
  };

  return (
    <div className="flex w-full border-b p-2 gap-4">
      <Input
        className=""
        defaultValue={search.q}
        placeholder="Search name or email"
        onChange={(e) => handleChange({ q: e.target.value })}
      />
      <div className="flex gap-4">
        <div className="flex gap-2 items-center cursor-pointer">
          <Checkbox
            id="checkbox-toggle-deleted"
            defaultChecked={search.show_deleted}
            onCheckedChange={(showDeleted) => {
              handleChange({
                show_deleted:
                  typeof showDeleted === "string" ? false : showDeleted,
              });
            }}
          />
          <Label
            htmlFor="checkbox-toggle-deleted"
            className="whitespace-nowrap"
          >
            Show deleted
          </Label>
        </div>
        <Button
          className="gap-2"
          variant="outline"
          onClick={() =>
            navigate({
              to: "/employees/$employee-id",
              params: { "employee-id": "new" },
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add employee
        </Button>
      </div>
    </div>
  );
}

const isoToTime = (date: string) => new Date(date).getTime();

import { EmployeesRecord, useStore } from "@/services/store/store-service";
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
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

  return (
    <div className="p-2">
      <h2 className="mb-4">{!employee ? "Add employee" : "Update employee"}</h2>
      <UserForm onSubmit={() => {}} initialData={employee} />
    </div>
  );
}

type Props = {
  initialData: EmployeesRecord | null;
  onSubmit: (data: EmployeesRecord) => void;
};

const defaultEmployee = () => ({
  id: v4(),
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  deleted_at: null,
});

const UserForm: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<EmployeesRecord>(
    initialData || defaultEmployee()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="first_name"
          className="block text-sm font-medium text-gray-700"
        >
          First name
        </label>
        <input
          type="text"
          name="first_name"
          id="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="last_name"
          className="block text-sm font-medium text-gray-700"
        >
          Last name
        </label>
        <input
          type="text"
          name="last_name"
          id="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="phone_number"
          className="block text-sm font-medium text-gray-700"
        >
          Phone
        </label>
        <input
          type="tel"
          name="phone_number"
          id="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {/* <div>
        <label
          htmlFor="deleted_at"
          className="block text-sm font-medium text-gray-700"
        >
          Deleted At
        </label>
        <input
          type="datetime-local"
          name="deleted_at"
          id="deleted_at"
          value={formData.deleted_at || ""}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div> */}
      <div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default UserForm;

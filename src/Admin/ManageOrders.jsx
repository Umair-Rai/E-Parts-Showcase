import React from "react";
import { Download, MoreVertical } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Badge from "../components/Badge";

const SellerVerification = () => {
  return (
    <div className="p-6 font-inter bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Seller Verification</h1>
        <p className="text-sm text-gray-500">
          Review and verify breeding service sellers applying to the platform.
        </p>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        <Badge className="bg-green-100 text-green-800">Approved</Badge>
        <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex flex-wrap gap-4 items-center flex-grow">
          <Input placeholder="Seller Name or Email" className="w-full sm:w-60" />
          <Input type="date" className="w-full sm:w-40" />
          <Input type="date" className="w-full sm:w-40" />

          <Select
            options={[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            placeholder="Verification Status"
            className="w-full sm:w-44"
          />

          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Apply Filters</Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="border-blue-500 text-blue-600">
            <Download className="w-4 h-4 mr-2" /> Export List
          </Button>
        </div>
      </div>

      {/* Seller Table */}
      <div className="overflow-x-auto shadow rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-3">
                <input type="checkbox" />
              </th>
              <th className="p-3">Seller</th>
              <th className="p-3">Email</th>
              <th className="p-3">Pet Type</th>
              <th className="p-3">Breed</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date Applied</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            <tr className="border-b hover:bg-gray-50">
              <td className="p-3">
                <input type="checkbox" />
              </td>
              <td className="p-3 font-medium">Umair Khan</td>
              <td className="p-3">umair@example.com</td>
              <td className="p-3">Dog</td>
              <td className="p-3">Golden Retriever</td>
              <td className="p-3">
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </td>
              <td className="p-3">16 July 2025</td>
              <td className="p-3">
                <MoreVertical className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <p>Showing 1 to 10 of 40 results</p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">Previous</Button>
          <Button variant="outline" size="sm" className="bg-blue-500 text-white">1</Button>
          <Button variant="ghost" size="sm">2</Button>
          <Button variant="ghost" size="sm">3</Button>
          <Button variant="ghost" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default SellerVerification;

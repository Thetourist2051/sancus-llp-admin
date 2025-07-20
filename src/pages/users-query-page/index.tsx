import React, { useState } from "react";
import CustomTable from "../../components/custom-table/CustomTable";

type Props = {};

const UserQueryPage: React.FC<Props> = ({}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [queryData, setQueryData] = useState<any[]>([]);
  const queryColumns = [
    {
      field: "name",
      header: "Name",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.name}</div>
      ),
    },
    {
      field: "email",
      header: "Email",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.email}</div>
      ),
    },
    {
      field: "phone",
      header: "Phone",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.phone}</div>
      ),
    },
    {
      field: "service",
      header: "Service",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.service}</div>
      ),
    },
    {
      field: "message",
      header: "Message",
      body: (rowData: any) => (
        <div className="ellipsis-text-2-line">{rowData.message}</div>
      ),
    },
    {
      field: "createdAt",
      header: "Query Date",
    },
  ];
  return (
    <>
      <div className="p-3">
        <CustomTable
          loading={loading}
          tablecolumns={queryColumns}
          tabledata={queryData}
        />
      </div>
    </>
  );
};

export default UserQueryPage;

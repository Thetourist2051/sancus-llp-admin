import React, { useState, useEffect } from "react";
import CustomTable from "../../components/custom-table/CustomTable";
import { HTTPService } from "../../services/http-service/http-service";
import OverlayLoader from "../../components/overlay-loader";
import { formatDate } from "../../services/utils-service/date-utils";

type Props = {};

const UserQueryPage: React.FC<Props> = ({}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [queryData, setQueryData] = useState<any[]>([]);

  const queryColumns = [
    {
      field: "fullName",
      header: "Full Name",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.fullName}</div>
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
      field: "phoneNumber",
      header: "Phone Number",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.phoneNumber}</div>
      ),
    },
    {
      field: "serviceType",
      header: "Service Type",
      body: (rowData: any) => (
        <div className="ellipsis-text">{rowData.serviceType}</div>
      ),
    },
    {
      field: "query",
      header: "Query",
      body: (rowData: any) => (
        <div className="ellipsis-text-2-line">{rowData.query}</div>
      ),
    },
    {
      field: "createdAt",
      header: "Created At",
    },
    {
      field: "updatedAt",
      header: "Updated At",
    },
  ];

  const fetchQueriesList = async () => {
    setLoading(true);
    try {
      const res = await HTTPService.getRequest("/admin/queries");
      if (res?.success) {
        const queryData = res.data.map((blog: any) => ({
          ...blog,
          createdAt: formatDate(blog.createdAt),
          updatedAt: formatDate(blog.updatedAt),
        }));
        setQueryData(queryData || []);
      }
    } catch (error) {
      console.error("Failed to fetch queries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueriesList();
  }, []);

  if (loading) {
    return <OverlayLoader />;
  }

  return (
    <div className="p-3">
      <CustomTable
        loading={loading}
        tablecolumns={queryColumns}
        tabledata={queryData}
      />
    </div>
  );
};

export default UserQueryPage;

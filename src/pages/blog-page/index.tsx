import React, { useEffect, useState } from "react";
import CustomTable, {
  type CustomColumnProps,
} from "../../components/custom-table/CustomTable";
import { HTTPService } from "../../services/http-service/http-service";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";
import { Button, type ButtonProps } from "primereact/button";
import { RouteConstant } from "../../constant/route-constant";
import { confirmDialog } from "primereact/confirmdialog";
import { classNames } from "primereact/utils";
import OverlayLoader from "../../components/overlay-loader";
import { formatDate } from "../../services/utils-service/date-utils";
import { showToast } from "../../services/toaster-service";

const BlogPage: React.FC = () => {
  console.log("in BlogPage");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [overlayLoading, setOverlayLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const res = await HTTPService.getRequest("/blogs");
      if (res?.success && Array.isArray(res.data)) {
        const blogData = res.data.map((blog: any) => ({
          ...blog,
          createdAt: formatDate(blog.createdAt),
          updatedAt: formatDate(blog.updatedAt),
        }));
        setBlogs(blogData);
      } else {
        setBlogs([]);
        showToast("warn", "No Data !", "No blogs Found ! ");
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const onEditPost = (rowData: any) => {
    navigate(RouteConstant.Admin.AddBlog, { state: { rowData } });
  };

  const onPublishPost = (rowData: any) => {
    showConfirmDialog("publish", rowData);
  };

  const onDeletePost = (rowData: any) => {
    showConfirmDialog("delete", rowData);
  };

  const onConfirmAction = async (action: string, rowData: any) => {
    try {
      setOverlayLoading(true);
      let res;

      if (action === "publish") {
        const isPublishing = !rowData.published;
        const api = `blogs/${rowData.id}/${
          isPublishing ? "publish" : "unpublish"
        }`;
        res = await HTTPService.patchRequest(api);
        if (res?.success) {
          showToast(
            "success",
            "Success",
            `Blog ${isPublishing ? "published" : "unpublished"} successfully.`
          );
        }
      } else if (action === "delete") {
        const isActivating = !rowData.isActive;
        const api = `blogs/${rowData.id}/${
          isActivating ? "activate" : "deactivate"
        }`;
        res = await HTTPService.patchRequest(api);
        if (res?.success) {
          showToast(
            "success",
            "Success",
            `Blog ${isActivating ? "activated" : "deactivated"} successfully.`
          );
        }
      }

      if (res?.success) {
        await fetchBlogPosts();
      }
    } catch {
      setOverlayLoading(false);
    } finally {
      setOverlayLoading(false);
    }
  };

  const showConfirmDialog = (type: string, rowData: any) => {
    const isPublish = type === "publish";
    const isActive = rowData.isActive;
    const isPublished = rowData.published;

    const actionText = isPublish
      ? isPublished
        ? "Un-publish"
        : "Publish"
      : isActive
      ? "Deactivate"
      : "Activate";

    confirmDialog({
      message: (
        <div className="d-flex flex-column align-items-center justify-content-center w-100 gap-4">
          <Icon
            icon="simple-line-icons:question"
            height={48}
            width={48}
            className="text-primary"
          />
          <h6 className="m-0 text-center fs-6 lh-base fw-normal">
            Are you sure you want to{" "}
            <span
              className={classNames("fw-medium", {
                "text-danger": actionText === "Deactivate",
                "text-success": actionText === "Activate",
                "text-primary": actionText === "Publish",
                "text-warning": actionText === "Un-publish",
              })}
            >
              {actionText}
            </span>{" "}
            the blog titled{" "}
            <span className="fw-semibold">"{rowData.title}"</span>?
          </h6>
        </div>
      ),
      header: "Confirmation",
      pt: {
        root: {
          className:
            "col-xl-4 col-lg-4 col-md-8 col-11 rounded-3 overflow-hidden",
        },
        header: {
          className: "px-3 pt-3 pb-2",
        },
        headerTitle: {
          className: "text-center fs-4 fw-medium",
        },
        content: {
          className: "w-100 d-block pt-0",
        },
        closeButton: {
          className: "d-none",
        },
        message: {
          className: "col-11 mx-auto",
        },
        footer: {
          className: "d-flex justify-content-center border-top-0 gap-2",
        },
      },
      acceptLabel: actionText,
      acceptClassName: classNames("p-button", {
        "p-button-danger": actionText === "Deactivate",
        "p-button-success":
          actionText === "Activate" || actionText === "Publish",
        "p-button-warning": actionText === "Un-publish",
      }),
      rejectLabel: "Cancel",
      rejectClassName: "p-button-secondary",
      position: "center",
      accept: () => onConfirmAction(type, rowData),
      closeOnEscape: true,
    });
  };

  const renderActionButtons = (rowData: any) => (
    <div className="d-flex justify-content-center align-items-center gap-2">
      {rowData?.isActive && (
        <Button
          icon={
            <Icon
              icon="streamline-ultimate:file-code-edit-1"
              height={18}
              width={18}
            />
          }
          rounded
          onClick={() => onEditPost(rowData)}
          className="smallRoundButton p-1"
          tooltip="Edit Blog"
        />
      )}

      <Button
        icon={
          <Icon
            icon={
              rowData?.published
                ? "material-symbols-light:file-upload-off"
                : "material-symbols-light:upload-rounded"
            }
            height={18}
            width={18}
          />
        }
        rounded
        className="smallRoundButton p-1"
        severity={rowData?.published ? "info" : "success"}
        onClick={() => onPublishPost(rowData)}
        tooltip={rowData?.published ? "Un-Publish Blog" : "Publish Blog"}
      />

      <Button
        icon={
          <Icon
            icon={
              rowData?.isActive
                ? "material-symbols:delete-outline-rounded"
                : "famicons:checkbox-outline"
            }
            height={18}
            width={18}
          />
        }
        rounded
        className="smallRoundButton p-1"
        severity={rowData?.isActive ? "danger" : "success"}
        onClick={() => onDeletePost(rowData)}
        tooltip={rowData?.isActive ? "Deactivate Blog" : "Activate Blog"}
      />
    </div>
  );

  const blogColumns: CustomColumnProps[] = [
    {
      header: "Action",
      minWidth: "180px",
      body: (rowData: any) => renderActionButtons(rowData),
      frozen: true,
      alignFrozen: "left",
      sortable: false,
    },
    {
      field: "title",
      header: "Blog Title",
      body: (rowData: any) => (
        <>
          <div className="ellipsis-text-2-line">{rowData.title}</div>
        </>
      ),
    },
    { field: "categoryName", header: "Category" },
    { field: "tags", header: "Blog Tags" },
    {
      field: "description",
      header: "Description",
      body: (rowData: any) => (
        <>
          <div
            className="ellipsis-text-2-line"
            dangerouslySetInnerHTML={{
              __html: rowData.description,
            }}
          />
        </>
      ),
    },
    { field: "writtenBy", header: "Author" },
    {
      field: "published",
      header: "Is Published ?",
      body: (row: any) => (row.published ? "Yes" : "No"),
    },
    {
      field: "isActive",
      header: "Is Deleted ?",
      body: (row: any) => (row.isActive ? "No" : "Yes"),
    },
    { field: "createdBy", header: "Created By" },
    { field: "createdAt", header: "Created At" },
    { field: "updatedBy", header: "Updated By" },
    { field: "updatedAt", header: "Updated At" },
  ];

  const actionButtonArray: ButtonProps[] = [
    {
      label: "Add Blog",
      icon: <Icon icon="iconoir:page-edit" height={18} width={18} />,
      onClick: () => navigate(RouteConstant.Admin.AddBlog),
      size: "small",
      className: "py-2 rounded-2 gap-2",
      pt: { label: { className: "fw-medium" } },
    },
  ];

  console.log("in Blog Page");

  return (
    <>
      {overlayLoading && <OverlayLoader />}
      <div className="p-3">
        <CustomTable
          loading={loading}
          tablecolumns={blogColumns}
          tabledata={blogs}
          actionButtonArray={actionButtonArray}
        />
      </div>
    </>
  );
};

export default BlogPage;

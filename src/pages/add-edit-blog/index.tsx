import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Chips, type ChipsChangeEvent } from "primereact/chips";
import { Icon } from "@iconify/react";
import styles from "./index.module.scss";
import { Editor, type EditorTextChangeEvent } from "primereact/editor";
import { classNames } from "primereact/utils";
import * as yup from "yup";
import { HTTPService } from "../../services/http-service/http-service";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router";
import { baseUrl } from "../../services/http-service/axios";
import { showToast } from "../../services/toaster-service";
import DOMPurify from "dompurify";

// Type definitions
type BlogFormData = {
  title: string;
  description: string;
  writtenBy: string;
  categoryName: string;
  tags: string[];
};

type FileWithPreview = {
  file?: File;
  preview: string;
  isExisting?: boolean;
};

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

const categoryOptions = [
  { label: "Technology", value: "technology" },
  { label: "Business", value: "business" },
  { label: "Health", value: "health" },
  { label: "Travel", value: "travel" },
  { label: "Food", value: "food" },
];

// Validation Schema
const blogFormSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .max(250, "Max Length of Title is 250!"),
  description: yup
    .string()
    .required("Description is required")
    .max(7500, "Max Length of Decription is 7500 !"),
  writtenBy: yup
    .string()
    .required("Author is required")
    .max(60, "Max Length of Author is 60 !"),
  categoryName: yup.string().required("Category is required !"),
  tags: yup.array().of(yup.string().max(MAX_TAG_LENGTH)).max(MAX_TAGS),
});

const validateFiles = (files: FileWithPreview[], isEditMode: boolean) => {
  if (files.length === 0 && !isEditMode) return "Featured image is required";
  if (files.length > 0) {
    const file = files[0];
    if (file.file) {
      if (!ACCEPTED_FILE_TYPES.includes(file.file.type)) {
        return "Only JPG, JPEG, PNG files are allowed";
      }
      if (file.file.size > MAX_FILE_SIZE) {
        return "File size must be less than 5MB";
      }
    }
  }
  return null;
};

const AddEditBlogPage: React.FC = () => {
  const location = useLocation();
  const [editData, setEditData] = useState<any>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    description: "",
    writtenBy: "",
    categoryName: "",
    tags: [],
  });
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (location?.state?.rowData) {
      const rowData = location?.state?.rowData;
      console.log("rowData--------->", rowData);
      setEditData(rowData);
      setFormData({
        title: rowData?.title,
        categoryName: rowData?.categoryName,
        description: DOMPurify.sanitize(rowData.description),
        writtenBy: rowData?.writtenBy,
        tags: rowData?.tags?.split(",") || [],
      });

      // Set existing image for edit mode
      if (rowData?.image) {
        setFiles([
          {
            preview: rowData.image,
            isExisting: true,
          },
        ]);
      }
    }
  }, [location]);

  const validateField = async (field: string, value: any) => {
    try {
      await blogFormSchema.validateAt(field, { [field]: value });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [field]: err?.message }));
      }
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    await validateField(name, value);
  };

  const handleCategoryChange = async (e: { value: string }) => {
    setFormData((prev) => ({ ...prev, categoryName: e.value }));
    await validateField("categoryName", e.value);
  };

  const handleDescriptionChange = async (e: EditorTextChangeEvent) => {
    console.log('e.htmlValue',e.htmlValue)
    const value = e.htmlValue || "";
    setFormData((prev) => ({ ...prev, description: value }));
    await validateField("description", value);
  };

  const handleTagsChange = async (e: ChipsChangeEvent) => {
    const value = e.value || [];
    setFormData((prev) => ({ ...prev, tags: value }));
    await validateField("tags", value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (
        ACCEPTED_FILE_TYPES.includes(file.type) &&
        file.size <= MAX_FILE_SIZE
      ) {
        const fileWithPreview = {
          file,
          preview: URL.createObjectURL(file),
          isExisting: false,
        };
        setFiles([fileWithPreview]);
        setErrors((prev) => ({ ...prev, files: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          files: "Only JPG, JPEG, PNG under 5MB allowed",
        }));
      }
    }
  };

  const removeFile = () => {
    if (files.length > 0) {
      // Only revoke object URL if it's not an existing image
      if (!files[0].isExisting) {
        URL.revokeObjectURL(files[0].preview);
      }
      setFiles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await blogFormSchema.validate(formData, { abortEarly: false });

      const fileError = validateFiles(files, !!editData);
      if (fileError) {
        setErrors((prev) => ({ ...prev, files: fileError }));
        setIsSubmitting(false);
        return;
      }

      const formDataPayload = new FormData();
      formDataPayload.append("title", formData.title);
      formDataPayload.append("description", formData.description);
      formDataPayload.append("writtenBy", formData.writtenBy);
      formDataPayload.append("categoryName", formData.categoryName);
      formDataPayload.append("tags", formData.tags.join(","));

      if (files.length > 0 && files[0].file) {
        formDataPayload.append("image", files[0].file);
      }

      let res;
      if (editData) {
        res = await HTTPService.putRequest(
          `blogs/${editData.id}`,
          formDataPayload
        );
      } else {
        res = await HTTPService.postRequest("blogs", formDataPayload);
      }

      if (res && res.success) {
        showToast(
          "success",
          "Success",
          `Blog ${editData ? "updated" : "created"} successfully.`
        );
        navigate("/admin/blogs");
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const newErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Submission Error:", err);
        showToast("error", "Error", "There was an error submitting the form");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormErrorMessage = (name: string) => {
    return (
      errors[name] && (
        <small className="p-error block mt-1">
          <Icon icon="mdi:alert-circle" className="mr-1" />
          {errors[name]}
        </small>
      )
    );
  };

  const previewImage = files[0]?.preview || null;

  return (
    <div className={styles["add-edit-blog-page"]}>
      <form className={styles["blog-form"]} onSubmit={handleSubmit}>
        <div className={styles["scroll-section"]}>
          <div className="row m-0">
            <div className="col-md-6 px-2">
              <div className={styles["form-group"]}>
                <label htmlFor="title">
                  Title <span className="text-danger small ps-1">*</span>
                </label>
                <InputText
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={classNames(styles["form-control"], {
                    "p-invalid": errors.title,
                  })}
                  placeholder="Enter blog title"
                  maxLength={100}
                />
                {getFormErrorMessage("title")}
              </div>
            </div>

            <div className="col-md-6 px-2">
              <div className={styles["form-group"]}>
                <label htmlFor="writtenBy">
                  Author <span className="text-danger small ps-1">*</span>
                </label>
                <InputText
                  id="writtenBy"
                  name="writtenBy"
                  value={formData.writtenBy}
                  onChange={handleInputChange}
                  className={classNames(styles["form-control"], {
                    "p-invalid": errors.writtenBy,
                  })}
                  placeholder="Enter author name"
                  maxLength={50}
                />
                {getFormErrorMessage("writtenBy")}
              </div>
            </div>

            <div className="col-md-6 px-2">
              <div className={styles["form-group"]}>
                <label htmlFor="categoryName">
                  Category <span className="text-danger small ps-1">*</span>
                </label>
                <Dropdown
                  id="categoryName"
                  filter
                  value={formData.categoryName}
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                  placeholder="Select a category"
                  className={classNames("p-0 w-100", {
                    "p-invalid": errors.categoryName,
                  })}
                />
                {getFormErrorMessage("categoryName")}
              </div>
            </div>

            <div className="col-md-6 px-2">
              <div className={styles["form-group"]}>
                <label htmlFor="tags">Tags</label>
                <Chips
                  id="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  className={classNames(
                    styles["form-control"] + " p-0 border-0",
                    { "p-invalid": errors.tags }
                  )}
                  placeholder={`Add up to ${MAX_TAGS} tags`}
                  separator=","
                  max={MAX_TAGS}
                  pt={{
                    container: { className: "py-0 px-2" },
                    input: { maxLength: MAX_TAG_LENGTH },
                  }}
                />
                {getFormErrorMessage("tags")}
              </div>
            </div>

            <div className="col-12 px-2">
              <div className={styles["form-group"]}>
                <label htmlFor="description">
                  Description <span className="text-danger small ps-1">*</span>
                </label>
                <Editor
                  id="description"
                  value={formData.description}
                  onTextChange={handleDescriptionChange}
                  className={classNames(styles["form-control"], {
                    "p-invalid": errors.description,
                  })}
                  style={{ height: "250px" }}
                  placeholder="Enter blog description"
                />
                {getFormErrorMessage("description")}
              </div>
            </div>

            <div className="col-12 px-2">
              <div className={styles["file-upload"]}>
                <label htmlFor="files">
                  Featured Image{" "}
                  <span className="text-danger small ps-1">*</span>
                </label>
                <div
                  className={`${styles["upload-area"]} ${
                    previewImage ? styles["has-files"] : ""
                  } ${errors.files ? styles["error-border"] : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles["upload-icon"]}>
                    <Icon icon="uil:cloud-upload" width="32" height="32" />
                  </div>
                  <div className={styles["upload-text"]}>
                    Click to upload or drag and drop
                  </div>
                  <div className={styles["file-requirements"]}>
                    JPG, JPEG, PNG (Max File Size: 5MB)
                  </div>
                  <input
                    type="file"
                    id="files"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/jpg,image/png"
                    multiple={false}
                    style={{ display: "none" }}
                  />
                </div>
                {errors.files && (
                  <small className="p-error block mt-1">
                    <Icon icon="mdi:alert-circle" className="mr-1" />
                    {errors.files}
                  </small>
                )}
                {previewImage && (
                  <div className={styles["file-preview"]}>
                    <div className={styles["file-item"]}>
                      <img
                        src={
                          files[0]?.isExisting
                            ? `${baseUrl}${previewImage}`
                            : previewImage
                        }
                        alt="Preview"
                      />
                      <div className={styles["file-name"]}>
                        {files[0]?.file?.name || previewImage.split("/").pop()}
                      </div>
                      <button
                        type="button"
                        className={styles["remove-file"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                      >
                        <Icon icon="mdi:close" width="12" height="12" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles["form-actions"]}>
          <Button
            type="button"
            className={styles["action-button"]}
            disabled={isSubmitting}
            severity="secondary"
          >
            <Icon icon="mdi:cancel" width="18" height="18" />
            Cancel
          </Button>
          <Button
            type="submit"
            className={styles["action-button"]}
            disabled={isSubmitting}
            iconPos="right"
            label={
              editData
                ? isSubmitting
                  ? "Updating Blog..."
                  : "Update Blog"
                : isSubmitting
                ? "Submitting Blog..."
                : "Submit Blog"
            }
            icon={<Icon icon="ph:paper-plane-right" width="18" height="18" />}
          />
        </div>
      </form>
    </div>
  );
};

export default AddEditBlogPage;

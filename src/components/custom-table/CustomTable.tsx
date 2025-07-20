import { useState, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column, type ColumnProps } from "primereact/column";
import style from "./CustomTable.module.scss";
import { Button } from "primereact/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { ButtonProps } from "primereact/button";

export interface CustomColumnProps extends ColumnProps {
  minWidth?: string;
  colkeyid?: string;
  isActionColumn?: boolean;
}

interface TableProps {
  tabledata?: any[];
  scrollHeight?: string;
  tablecolumns: CustomColumnProps[];
  actionButtonArray?: ButtonProps[];
  loading?: boolean;
}

const CustomTable = ({
  tabledata = [],
  scrollHeight = "calc(100vh - 210px)",
  tablecolumns,
  actionButtonArray = [],
  loading,
}: TableProps) => {
  const [globalFilters, setGlobalFilters] = useState("");
  const [value, setValue] = useState<boolean>(false);

  const processedColumns = useMemo(
    () =>
      tablecolumns.map((column, idx) => ({
        ...column,
        minWidth: column.minWidth ?? "180px",
        body: column?.body ?? null,
        colkeyid: column.colkeyid ?? column.field ?? `col-${idx}`,
      })),
    [tablecolumns]
  );

  const processedData = useMemo(
    () =>
      tabledata.map((data, idx) => ({
        ...data,
        id: data.id ?? `row-${idx}`,
      })),
    [tabledata]
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pb-3 table_caption">
        <div
          role="button"
          className={`${style["global-filter"]} transition relative max ${
            value ? style["has-value"] : style["no-value"]
          }`}
        >
          <span
            className={`${style["filter-span"]} cursor-pointer`}
            onClick={() => setValue(!value)}
          >
            <Icon icon={"iconamoon:search"} height={20} width={20}></Icon>
          </span>

          <input
            type="text"
            value={globalFilters}
            onChange={(e) => setGlobalFilters(e.target.value)}
            className={`${style["filter-input"]} transition`}
            placeholder="Search here..."
            id="global_filter"
          />

          {globalFilters && (
            <span
              className={`${style["filter-span"]} cursor-pointer transition`}
              onClick={() => setGlobalFilters("")}
            >
              <Icon icon={"mi:close"} height={20} width={20}></Icon>
            </span>
          )}
        </div>

        <div className={style["action_section"] + " flex gap-x-2"}>
          {actionButtonArray?.map((action, index) => (
            <Button
              {...action}
              label={action?.label}
              key={index}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>

      <DataTable
        value={processedData}
        className="global-table-style rounded-tl-none rounded-tr-none"
        size="small"
        showGridlines
        stripedRows
        scrollable
        scrollHeight={scrollHeight}
        reorderableColumns
        globalFilter={globalFilters}
        paginator
        rows={15}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorClassName="custom_paginator_class"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        removableSort
        loading={loading}
        
      >
        {processedColumns.map((col) => (
          <Column
            {...col}
            key={col.colkeyid}
            headerStyle={{ minWidth: col.minWidth }}
          />
        ))}
      </DataTable>
    </>
  );
};

export default CustomTable;

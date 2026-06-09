import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ExportButton({ data, filename, buttonText, buttonStyle, icon }) {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Prepare data for export
    const exportData = data.map((item) => {
      const row = {};

      // Common fields
      row["Transaction #"] = item.transactionNumber || "";
      row["Date"] = item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : "";
      row["Type"] =
        item.transactionType === "guest_personal" ? "🏨 Guest" : "📦 Company";
      row["Direction"] =
        item.direction === "IN" ? "IN (Entering)" : "OUT (Leaving)";
      row["Equipment"] = item.equipmentName || "";
      row["Quantity"] = item.quantity || 1;
      row["Brand"] = item.brand || "";
      row["Serial #"] = item.serialNumber || "";
      row["Description"] = item.description || "";

      // Guest specific
      if (item.transactionType === "guest_personal") {
        row["Guest Name"] = item.guestName || "";
        row["Room Number"] = item.roomNumber || "";
        row["Guest ID"] = item.guestId || "";
        row["Nationality"] = item.nationality || "";
        row["Staff/Department"] = "";
        row["Employee ID"] = "";
        row["Purpose"] = "";
      }
      // Staff/Company specific
      else {
        row["Guest Name"] = "";
        row["Room Number"] = "";
        row["Guest ID"] = "";
        row["Nationality"] = "";
        row["Staff/Department"] =
          `${item.staffName || ""} (${item.staffDepartment || ""})`;
        row["Employee ID"] = item.staffEmployeeId || "";
        row["Purpose"] = item.purpose || "";
      }

      // Common fields continued
      row["Security Guard"] = item.securityName || "";
      row["Condition"] = item.condition || "Good";
      row["Status"] = item.isReturned ? "Returned" : "Active";
      if (item.expectedReturnTime) {
        row["Expected Return"] = new Date(
          item.expectedReturnTime,
        ).toLocaleString();
      }
      row["Notes"] = item.notes || "";

      return row;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns (simple version)
    const maxWidth = 20;
    worksheet["!cols"] = Object.keys(exportData[0] || {}).map(() => ({
      wch: maxWidth,
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    // Save file
    const fullFilename = `${filename}_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.xlsx`;
    saveAs(blob, fullFilename);
  };

  return (
    <button
      onClick={exportToExcel}
      style={buttonStyle}
      title={`Export to Excel - ${filename}`}
    >
      {icon || "📊"} {buttonText || "Export to Excel"}
    </button>
  );
}

export default ExportButton;

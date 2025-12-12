import { useEffect, useState } from "react";
import { fetchLicenseDetails, ingestLicenses } from "./api/scormApi";
import type { LicenseRow, IngestReport } from "./types";
import { SimpleTable } from "./components/SimpleTable";
import "./App.css";

// Get last month's date range
const getLastMonthRange = () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const year = lastMonth.getFullYear();
  const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
  const firstDay = `${year}-${month}-01`;
  const lastDay = new Date(year, lastMonth.getMonth() + 1, 0).getDate();
  const lastDayStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
  return { firstDay, lastDayStr };
};

const { firstDay, lastDayStr } = getLastMonthRange();

export default function App() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestReport, setIngestReport] = useState<IngestReport | null>(null);
  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDayStr);

  const loadData = async () => {
    setLoading(true);
    try {
      const rows = await fetchLicenseDetails({
        date_from: dateFrom,
        date_to: dateTo,
        page: 1,
      });
      setLicenses(rows);
    } catch (error) {
      console.error("Error loading licenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async () => {
    setIngesting(true);
    setIngestReport(null);
    try {
      const report = await ingestLicenses();
      console.log("Ingest report:", report);
      setIngestReport(report);
      
      // Reload data after ingestion
      await loadData();
    } catch (error) {
      console.error("Error ingesting licenses:", error);
      alert("Error updating database");
    } finally {
      setIngesting(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>License Details</h1>

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <label>
          Date From:
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ marginLeft: "8px", padding: "4px" }}
          />
        </label>
        <label>
          Date To:
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ marginLeft: "8px", padding: "4px" }}
          />
        </label>
        <button onClick={loadData} disabled={loading} style={{ padding: "6px 16px" }}>
          {loading ? "Loading..." : "Search"}
        </button>
        <button 
          onClick={handleIngest} 
          disabled={ingesting || loading} 
          style={{ padding: "6px 16px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: ingesting ? "not-allowed" : "pointer" }}
        >
          {ingesting ? "Updating..." : "Update Database"}
        </button>
      </div>

      {ingestReport && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "16px", 
          backgroundColor: "#d4edda", 
          border: "1px solid #c3e6cb", 
          borderRadius: "4px",
          color: "#155724"
        }}>
          <strong>Database updated successfully!</strong>
          <div style={{ marginTop: "8px" }}>
            <div>📥 New entries from API: <strong>{ingestReport.fetched}</strong></div>
            <div>💾 Inserted to database: <strong>{ingestReport.upserted}</strong></div>
            <div>📅 Date range: <strong>{ingestReport.fromDate}</strong> to <strong>{ingestReport.toDate}</strong></div>
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}

      {!loading && (
        <SimpleTable
          columns={[
            { key: "customer_name", label: "Customer" },
            { key: "user_fullname", label: "User" },
            { key: "product_title", label: "Product" },
            { key: "license_start", label: "License Start" },
            { key: "license_end", label: "License End" },
            { key: "tracking_visits", label: "Visits" },
          ]}
          rows={licenses}
        />
      )}
    </div>
  );
}

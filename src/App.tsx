import { useEffect, useState } from "react";
import { fetchLicenseDetails } from "./api/scormApi";
import type { LicenseRow } from "./types";

export default function App() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const rows = await fetchLicenseDetails();
      setLicenses(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1>License Details</h1>

      {loading && <p>Loading…</p>}

      {!loading && (
        <pre>{JSON.stringify(licenses, null, 2)}</pre>
      )}
    </div>
  );
}

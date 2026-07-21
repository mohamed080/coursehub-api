/**
 * Converts an array of objects into a CSV formatted string.
 *
 * @param {Array<Object>} data Array of flat/flattened objects
 * @param {Array<{ label: string, key: string }>} columns Header definitions
 * @returns {string} CSV text
 */
const jsonToCsv = (data = [], columns = []) => {
  if (!Array.isArray(data) || data.length === 0) {
    const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");
    return `${headers}\n`;
  }

  // Auto-detect columns if not specified
  const cols =
    columns.length > 0
      ? columns
      : Object.keys(data[0]).map((k) => ({ label: k, key: k }));

  const headerRow = cols.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(",");

  const rows = data.map((item) => {
    return cols
      .map((col) => {
        let val = item[col.key];

        if (val === null || val === undefined) {
          val = "";
        } else if (typeof val === "object") {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  return [headerRow, ...rows].join("\n");
};

module.exports = {
  jsonToCsv,
};

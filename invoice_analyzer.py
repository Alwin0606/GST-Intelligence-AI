import pandas as pd

REQUIRED_COLUMNS = [
    "invoice_number",
    "invoice_date",
    "taxable_value",
    "gst_rate",
    "total_gst",
    "invoice_total",
]


def analyze_invoices(file_path):
    if file_path.lower().endswith(".csv"):
        df = pd.read_csv(file_path)
    elif file_path.lower().endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path)
    else:
        raise ValueError("Only CSV and Excel invoice files are supported.")

    df.columns = [
        str(column).strip().lower().replace(" ", "_")
        for column in df.columns
    ]

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))

    issues = []
    seen = set()

    for index, row in df.iterrows():
        row_number = int(index) + 2
        invoice = str(row["invoice_number"]).strip()

        if not invoice or invoice.lower() == "nan":
            issues.append({
                "row": row_number,
                "invoice_number": "",
                "risk": "High",
                "issue": "Missing invoice number",
            })
        elif invoice in seen:
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "High",
                "issue": "Duplicate invoice number",
            })
        else:
            seen.add(invoice)

        fields = ["taxable_value", "gst_rate", "total_gst", "invoice_total"]
        values = {
            field: pd.to_numeric(row[field], errors="coerce")
            for field in fields
        }

        if any(pd.isna(value) for value in values.values()):
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "High",
                "issue": "Missing or invalid numeric value",
            })
            continue

        taxable = float(values["taxable_value"])
        rate = float(values["gst_rate"])
        reported_gst = float(values["total_gst"])
        reported_total = float(values["invoice_total"])

        if taxable < 0:
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "High",
                "issue": "Negative taxable value",
            })

        if rate < 0 or rate > 100:
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "High",
                "issue": "GST rate outside allowed range",
            })
            continue

        expected_gst = round(taxable * rate / 100, 2)
        expected_total = round(taxable + expected_gst, 2)

        if abs(reported_gst - expected_gst) > 0.02:
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "Medium",
                "issue": "GST amount mismatch",
            })

        if abs(reported_total - expected_total) > 0.02:
            issues.append({
                "row": row_number,
                "invoice_number": invoice,
                "risk": "Medium",
                "issue": "Invoice total mismatch",
            })

    return {
        "total_invoices": int(len(df)),
        "issue_count": len(issues),
        "high_risk_count": sum(item["risk"] == "High" for item in issues),
        "medium_risk_count": sum(item["risk"] == "Medium" for item in issues),
        "issues": issues,
    }
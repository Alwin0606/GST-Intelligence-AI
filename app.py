
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/health")
def health():
    return jsonify({
        "status": "online",
        "project": "GST Intelligence AI",
        "version": "1.0.0"
    })


@app.route("/api/gst/calculate", methods=["POST"])
def calculate_gst():
    data = request.get_json(silent=True) or {}

    try:
        taxable_value = float(data.get("taxable_value", 0))
        gst_rate = float(data.get("gst_rate", 0))
        tax_type = str(data.get("tax_type", "intra")).lower()

        if taxable_value < 0 or gst_rate < 0 or gst_rate > 100:
            return jsonify({"error": "Enter a valid taxable value and GST rate."}), 400

        if tax_type not in ("intra", "inter"):
            return jsonify({"error": "Tax type must be intra or inter."}), 400

        total_gst = round(taxable_value * gst_rate / 100, 2)

        if tax_type == "intra":
            cgst = round(total_gst / 2, 2)
            sgst = round(total_gst - cgst, 2)
            igst = 0.0
        else:
            cgst = 0.0
            sgst = 0.0
            igst = total_gst

        return jsonify({
            "taxable_value": round(taxable_value, 2),
            "gst_rate": gst_rate,
            "cgst": cgst,
            "sgst": sgst,
            "igst": igst,
            "total_gst": total_gst,
            "invoice_total": round(taxable_value + total_gst, 2)
        })

    except (ValueError, TypeError):
        return jsonify({"error": "Please enter valid numeric values."}), 400

@app.route("/api/invoices/analyze", methods=["POST"])
def analyze_invoice_upload():
    import os
    import uuid
    from werkzeug.utils import secure_filename
    from invoice_analyzer import analyze_invoices

    uploaded_file = request.files.get("file")

    if not uploaded_file or not uploaded_file.filename:
        return jsonify({"error": "Please select a CSV or XLSX invoice file."}), 400

    filename = secure_filename(uploaded_file.filename)
    extension = os.path.splitext(filename)[1].lower()

    if extension not in (".csv", ".xlsx"):
        return jsonify({"error": "Only CSV and XLSX files are supported."}), 400

    upload_dir = os.path.join(app.root_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    temp_path = os.path.join(upload_dir, f"{uuid.uuid4().hex}{extension}")

    try:
        uploaded_file.save(temp_path)
        report = analyze_invoices(temp_path)
        return jsonify(report)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    app.run(debug=True, port=5000)

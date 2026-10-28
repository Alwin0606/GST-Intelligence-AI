# GST Intelligence AI 🚀
### AI-Powered GST Calculation & Invoice Risk Analysis Platform

GST Intelligence AI is a Python-based financial intelligence application designed to simplify Goods and Services Tax (GST) calculations and identify potential inconsistencies in invoice data. Built with Flask, Pandas, and machine-learning tools, the platform combines tax calculations, invoice validation, and risk-focused analysis in a single dashboard.

## ✨ Key Features

- **GST Calculator** — Calculate GST using configurable tax rates.
- **Tax Breakdown** — Calculate CGST, SGST, and IGST based on the selected transaction type.
- **Invoice Analysis** — Upload CSV and supported Excel files for automated analysis.
- **Duplicate Invoice Detection** — Flag repeated invoice numbers for investigation.
- **GST Mismatch Detection** — Identify differences between expected and recorded GST amounts.
- **Invoice Total Validation** — Flag discrepancies between taxable value, tax, and invoice totals.
- **Risk Indicators** — Highlight potential data-quality and financial inconsistencies.
- **Interactive Dashboard** — View GST calculations and invoice analysis results through a web interface.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Python | Core application logic |
| Flask | Web application and API endpoints |
| Pandas | Invoice data processing |
| Scikit-learn | Machine-learning toolkit for potential anomaly-analysis extensions |
| OpenPyXL | Excel file processing |
| HTML5 & CSS3 | Dashboard structure and styling |
| JavaScript | Frontend interactions and API integration |

## 🏗️ Project Structure

```text
GST-Intelligence-AI/
├── app.py
├── invoice_analyzer.py
├── requirements.txt
├── sample_invoices.csv
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── script.js
├── reports/
├── uploads/
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Python installed on your system
- Git (optional, for cloning the repository)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/GST-Intelligence-AI.git
cd GST-Intelligence-AI
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Create a virtual environment

```powershell
python -m venv .venv
```

### 3. Activate the environment on Windows

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 5. Start the application

```powershell
python app.py
```

Open the local URL displayed in the terminal. For the current local setup, the application may be accessed at:

```text
http://127.0.0.1:5001
```

The port depends on the application's run configuration.

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Loads the dashboard |
| `/api/health` | GET | Checks application availability |
| `/api/gst/calculate` | POST | Calculates GST amounts |
| `/api/invoices/analyze` | POST | Analyzes an uploaded invoice file |

## 🧪 Sample Testing

The repository includes `sample_invoices.csv` for testing invoice analysis.

The sample data can be used to test:
- Duplicate invoice identification
- GST amount mismatch detection
- Invoice total discrepancy detection

Use fictional records for demonstrations and testing.

## 🔐 Data Security

- Keep virtual environments and temporary uploaded files out of version control.
- Never commit confidential financial records, credentials, or environment secrets.
- Use synthetic invoice data in public demonstrations.

## ⚠️ Disclaimer

GST Intelligence AI is a project for financial-data analysis and educational demonstration. Its findings indicate potential discrepancies and require human verification. It does not replace professional tax advice, statutory audits, or verification against applicable GST rules.

## 🚀 Future Enhancements

- GST return and purchase-register reconciliation
- Downloadable audit reports
- Enhanced anomaly detection
- Multi-file invoice reconciliation
- Configurable validation rules
- Expanded reporting and visual analytics

## 👨‍💻 Author

**Your Name**

Python | Flask | Financial Intelligence | Data Analysis

---

*Built to make GST calculations and invoice reviews more efficient, transparent, and accessible.*

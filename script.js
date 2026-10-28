
document.addEventListener("DOMContentLoaded", () => {
    const gstForm = document.getElementById("gstForm");
    const invoiceForm = document.getElementById("invoiceForm");
    const invoiceFile = document.getElementById("invoiceFile");

    function currency(value) {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value) || 0);
    }

    function showMessage(message, isError = false) {
        let resultBox = document.getElementById("gstResult");

        if (!resultBox) {
            resultBox = document.createElement("div");
            resultBox.id = "gstResult";
            resultBox.className = "result-box";

            const target = invoiceForm || gstForm;
            if (target) {
                target.insertAdjacentElement("afterend", resultBox);
            } else {
                document.querySelector(".main-content")?.appendChild(resultBox);
            }
        }

        if (!resultBox) {
            console.log(message);
            return;
        }

        resultBox.replaceChildren();
        resultBox.style.whiteSpace = "pre-wrap";
        resultBox.style.color = isError ? "#ff7777" : "";
        resultBox.textContent = message;
    }

    // GST calculator
    if (gstForm) {
        gstForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const taxableValue = Number(
                document.getElementById("taxable")?.value
            );
            const gstRate = Number(
                document.getElementById("gstRate")?.value
            );
            const taxType = document.getElementById("taxType")?.value;

            if (
                !Number.isFinite(taxableValue) ||
                !Number.isFinite(gstRate) ||
                taxableValue < 0 ||
                gstRate < 0 ||
                gstRate > 100
            ) {
                showMessage("Enter a valid taxable value and GST rate.", true);
                return;
            }

            try {
                const response = await fetch("/api/gst/calculate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        taxable_value: taxableValue,
                        gst_rate: gstRate,
                        tax_type: taxType
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "GST calculation failed.");
                }

                const resultTaxable = document.getElementById("resultTaxable");
                if (resultTaxable) {
                    resultTaxable.textContent = currency(result.taxable_value);
                }

                const resultCgst = document.getElementById("resultCgst");
                if (resultCgst) resultCgst.textContent = currency(result.cgst);

                const resultSgst = document.getElementById("resultSgst");
                if (resultSgst) resultSgst.textContent = currency(result.sgst);

                const resultIgst = document.getElementById("resultIgst");
                if (resultIgst) resultIgst.textContent = currency(result.igst);

                const resultTotalGst = document.getElementById("resultTotalGst");
                if (resultTotalGst) {
                    resultTotalGst.textContent = currency(result.total_gst);
                }

                const resultInvoiceTotal =
                    document.getElementById("resultInvoiceTotal");
                if (resultInvoiceTotal) {
                    resultInvoiceTotal.textContent =
                        currency(result.invoice_total);
                }

                const taxableCard = document.getElementById("taxableValue");
                if (taxableCard) {
                    taxableCard.textContent = currency(result.taxable_value);
                }

                const gstCard = document.getElementById("gstValue");
                if (gstCard) {
                    gstCard.textContent = currency(result.total_gst);
                }

                showMessage(
                    `GST calculated successfully.\n` +
                    `Taxable value: ${currency(result.taxable_value)}\n` +
                    `CGST: ${currency(result.cgst)}\n` +
                    `SGST: ${currency(result.sgst)}\n` +
                    `IGST: ${currency(result.igst)}\n` +
                    `Total GST: ${currency(result.total_gst)}\n` +
                    `Invoice total: ${currency(result.invoice_total)}`
                );
            } catch (error) {
                showMessage(error.message || "Unable to calculate GST.", true);
            }
        });
    }

    // Invoice file validation and display
    if (invoiceFile) {
        invoiceFile.addEventListener("change", () => {
            const file = invoiceFile.files?.[0];

            if (!file) return;

            const extension = file.name.split(".").pop().toLowerCase();

            if (!["csv", "xlsx"].includes(extension)) {
                invoiceFile.value = "";
                showMessage("Only CSV and XLSX files are supported.", true);
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                invoiceFile.value = "";
                showMessage("File size must be less than 10 MB.", true);
                return;
            }

            showMessage(`Selected file: ${file.name}`);
        });
    }

    // Upload and analyze invoices
    if (invoiceForm) {
        invoiceForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const file = invoiceFile?.files?.[0];

            if (!file) {
                showMessage("Please choose an invoice file first.", true);
                return;
            }

            const formData = new FormData();
            formData.append("file", file);

            const submitButton = invoiceForm.querySelector(
                'button[type="submit"], input[type="submit"]'
            );

            const originalText = submitButton
                ? submitButton.textContent
                : "";

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Analyzing...";
            }

            showMessage("Analyzing invoices. Please wait...");

            try {
                const response = await fetch("/api/invoices/analyze", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error || "Invoice analysis failed."
                    );
                }

                const issueLines = (result.issues || []).map((issue) =>
                    `Row ${issue.row} | ` +
                    `${issue.invoice_number || "No invoice number"} | ` +
                    `${issue.risk} risk | ${issue.issue}`
                );

                const report = [
                    "INVOICE ANALYSIS COMPLETE",
                    `Invoices analyzed: ${result.total_invoices}`,
                    `Total issues: ${result.issue_count}`,
                    `High-risk issues: ${result.high_risk_count}`,
                    `Medium-risk issues: ${result.medium_risk_count}`,
                    "",
                    ...(issueLines.length ? issueLines : ["No issues found."])
                ].join("\n");

                showMessage(report);

                const riskCount = document.getElementById("riskCount");
                if (riskCount) {
                    riskCount.textContent = result.issue_count;
                }
            } catch (error) {
                showMessage(
                    error.message || "Unable to analyze the invoice file.",
                    true
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText || "Analyze Invoices";
                }
            }
        });
    }

    console.log("GST Intelligence AI frontend initialized.");
});

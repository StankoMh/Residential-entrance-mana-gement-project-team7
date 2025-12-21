package com.smartentrance.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.smartentrance.backend.model.Transaction;
import com.smartentrance.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class PdfReceiptService {

    private final String currency;

    private static final Color BRAND_COLOR = new Color(41, 128, 185); // Nice Blue
    private static final Color TABLE_HEADER_COLOR = new Color(236, 240, 241); // Light Gray
    private static final Color TEXT_COLOR = new Color(44, 62, 80); // Dark Blue/Grey

    public PdfReceiptService(@Value("${payment.currency:EUR}") String currency) {
        this.currency = currency;
    }

    public byte[] generateReceipt(Transaction transaction, User issuer) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            document.open();

            BaseFont baseFont;
            try {
                ClassPathResource fontResource = new ClassPathResource("fonts/arial.ttf");
                baseFont = BaseFont.createFont(fontResource.getPath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            } catch (IOException e) {
                baseFont = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
            }

            Font titleFont = new Font(baseFont, 22, Font.BOLD, BRAND_COLOR);
            Font headerFont = new Font(baseFont, 22, Font.BOLD, BRAND_COLOR);
            Font boldFont = new Font(baseFont, 11, Font.BOLD, TEXT_COLOR);
            Font normalFont = new Font(baseFont, 11, Font.NORMAL, TEXT_COLOR);
            Font linkFont = new Font(baseFont, 11, Font.UNDERLINE, new Color(0, 0, 255));
            Font footerFont = new Font(baseFont, 9, Font.ITALIC, Color.GRAY);

            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);

            PdfPCell logoCell = new PdfPCell(new Phrase("SMART ENTRANCE", titleFont));
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(logoCell);

            PdfPCell receiptTitleCell = new PdfPCell(new Phrase("OFFICIAL RECEIPT\nПЛАТЕЖЕН ДОКУМЕНТ", boldFont));
            receiptTitleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            receiptTitleCell.setBorder(Rectangle.NO_BORDER);
            headerTable.addCell(receiptTitleCell);

            document.add(headerTable);

            drawDivider(document, BRAND_COLOR);

            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(20f);

            String issuerName = (issuer != null) ? issuer.getFirstName() + " " + issuer.getLastName() : "System Automation";
            String issuerEmail = (issuer != null) ? issuer.getEmail() : "support@smartentrance.com";

            PdfPCell issuerCell = new PdfPCell();
            issuerCell.setBorder(Rectangle.NO_BORDER);
            issuerCell.addElement(new Phrase("ISSUED BY / ИЗДАТЕЛ:", boldFont));
            issuerCell.addElement(new Phrase(issuerName, normalFont));
            issuerCell.addElement(new Phrase(issuerEmail, normalFont));
            issuerCell.addElement(new Phrase("Date: " + formatDate(new Date()), normalFont));
            infoTable.addCell(issuerCell);

            String unitInfo = "Unit " + transaction.getUnit().getUnitNumber();
            String buildingName = transaction.getUnit().getBuilding().getName();
            String buildingAddress = transaction.getUnit().getBuilding().getAddress();

            PdfPCell payerCell = new PdfPCell();
            payerCell.setBorder(Rectangle.NO_BORDER);
            payerCell.addElement(new Phrase("BILLED TO / ПЛАТЕЦ:", boldFont));
            payerCell.addElement(new Phrase(unitInfo, normalFont));
            payerCell.addElement(new Phrase(buildingName, normalFont));
            payerCell.addElement(new Phrase(buildingAddress, normalFont));
            infoTable.addCell(payerCell);

            document.add(infoTable);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(20f);

            PdfPCell headerCell = new PdfPCell(new Phrase("PAYMENT DETAILS / ДЕТАЙЛИ", headerFont));
            headerCell.setColspan(2);
            headerCell.setBackgroundColor(BRAND_COLOR);
            headerCell.setPadding(8f);
            headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(headerCell);

            addStyledRow(table, "Transaction ID", "#" + transaction.getId(), boldFont, normalFont);
            addStyledRow(table, "Payment Date", formatDate(transaction.getCreatedAt()), boldFont, normalFont);
            addStyledRow(table, "Payment Method", transaction.getPaymentMethod().toString(), boldFont, normalFont);
            addStyledRow(table, "Fund Type", transaction.getFundType().toString(), boldFont, normalFont);
            addStyledRow(table, "Description", transaction.getDescription(), boldFont, normalFont);
            addStyledRow(table, "Reference / Note", transaction.getReferenceId() != null ? transaction.getReferenceId() : "-", boldFont, normalFont);

            String externalProof = transaction.getExternalProofUrl();

            if (externalProof != null && !externalProof.isBlank()) {
                Anchor link = new Anchor("View Original Proof / Виж Оригинал", linkFont);
                link.setReference(externalProof);

                addCellElement(table, "External Proof", link, boldFont);
            }

            addStyledRow(table, "Status", transaction.getStatus().toString(), boldFont, normalFont);

            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL AMOUNT / СУМА:", boldFont));
            totalLabel.setPadding(10f);
            totalLabel.setBorderColor(BRAND_COLOR);
            table.addCell(totalLabel);

            Font amountFont = new Font(baseFont, 14, Font.BOLD, BRAND_COLOR);
            PdfPCell totalValue = new PdfPCell(new Phrase(transaction.getAmount() + " " + currency, amountFont));
            totalValue.setPadding(10f);
            totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalValue.setBorderColor(BRAND_COLOR);
            table.addCell(totalValue);

            document.add(table);

            PdfPTable footerTable = new PdfPTable(1);
            footerTable.setWidthPercentage(100);

            PdfPCell footerCell = new PdfPCell(new Phrase(
                    "Thank you for your timely payment! This is a computer-generated receipt.\n" +
                            "Благодарим за плащането! Това е автоматично генериран документ.",
                    footerFont));
            footerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            footerCell.setBorder(Rectangle.TOP);
            footerCell.setBorderColor(Color.LIGHT_GRAY);
            footerCell.setPaddingTop(10f);
            footerTable.addCell(footerCell);

            footerTable.setTotalWidth(document.getPageSize().getWidth() - document.leftMargin() - document.rightMargin());
            footerTable.writeSelectedRows(0, -1, document.leftMargin(), document.bottom() + 40, writer.getDirectContent());

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF receipt", e);
        }
    }

    private void addStyledRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setPadding(8f);
        cellLabel.setBorderColor(Color.LIGHT_GRAY);
        cellLabel.setBackgroundColor(new Color(250, 250, 250)); // Very light gray
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell(new Phrase(value, valueFont));
        cellValue.setPadding(8f);
        cellValue.setBorderColor(Color.LIGHT_GRAY);
        cellValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cellValue);
    }

    private void addCellElement(PdfPTable table, String label, Element element, Font labelFont) {
        PdfPCell cellLabel = new PdfPCell(new Phrase(label, labelFont));
        cellLabel.setPadding(6f);
        cellLabel.setBackgroundColor(new Color(240, 240, 240));
        cellLabel.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cellLabel);

        PdfPCell cellValue = new PdfPCell();

        Paragraph wrapper = new Paragraph();
        wrapper.add(element);
        wrapper.setAlignment(Element.ALIGN_RIGHT);

        cellValue.addElement(wrapper);

        cellValue.setPadding(6f);
        cellValue.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cellValue);
    }

    private void drawDivider(Document document, Color color) throws DocumentException {
        Paragraph p = new Paragraph(" ");
        p.setSpacingAfter(5f);
        document.add(p);

        com.lowagie.text.pdf.draw.LineSeparator line = new com.lowagie.text.pdf.draw.LineSeparator();
        line.setLineColor(color);
        line.setLineWidth(2f);
        document.add(line);

        Paragraph p2 = new Paragraph(" ");
        p2.setSpacingAfter(10f);
        document.add(p2);
    }

    private String formatDate(java.time.Instant instant) {
        if (instant == null) return "-";
        return new SimpleDateFormat("dd.MM.yyyy HH:mm").format(Date.from(instant));
    }

    private String formatDate(Date date) {
        return new SimpleDateFormat("dd.MM.yyyy HH:mm").format(date);
    }
}
# NEW CALI CONSTRUCTION — CONTRACT & PROPOSAL SKILL

## PURPOSE
Generate professional construction contracts and proposals for New Cali Construction Inc. that match the exact format and structure of existing contracts.

---

## COMPANY CONSTANTS (always pre-filled)
- **Company:** New Cali Construction Inc.
- **License:** #1008892
- **Address:** 10000 Washington Blvd. Suite #600, Culver City, CA 90232
- **Phone:** (800) 216-1005
- **Email:** Info@NewCaliConstruction.com
- **Website:** www.NewCaliConstruction.com
- **Zelle:** Info@NewCaliConstruction.com
- **Workers' Comp:** STATE COMPENSATION INSURANCE FUND, Policy No. 9150641, Exp. 01/09/2027
- **Owner signature:** Asaf Kotler

---

## CONTRACT STRUCTURE (pages 1–5 = variable, pages 6–12 = fixed boilerplate)

### PAGE 1 — HEADER + CLIENT/PROJECT + SCOPE START
```
[LOGO top center] [Lic. #1008892 top right] [Date top right]

CLIENT DETAILS:              PROJECT DETAILS:
Name: [client name]          Project location: [address]
Address: [address]
Phone: [phone]
Email: [email]

              [PROJECT TITLE — centered, bold, underlined]
        [Scope of work subtitle — italic, underlined, centered]

What's Included:
✅ [item]
✅ [item]
...

[Footer: website | license | email | phone | address | Page X]
[Bottom right: Initials boxes x3]
```

### PAGE 2 — SCOPE CONTINUED
```
✅ [remaining included items]

What's Not Included:
❌ [item]
❌ [item]
...
```

### PAGE 3 — PRICING & PAYMENT SCHEDULE
```
Contractor to supply (= Including):
• All labor and rough materials, such as [list materials]

Total price................................................................ $[AMOUNT]

[Payment schedule boilerplate paragraph]

1. Down payment ................................................................ $[X]
2. Upon completion of [phase] ................................................ $[X]
3. Upon completion of [phase] ................................................ $[X]
4. Upon completion of project and haul away all related debris .......... $[X]

• All payments are to be made via checks or bank transfers
  (Zelle to: Info@NewCaliConstruction.com).
```

**DOWN PAYMENT RULE:** Down payment must NOT exceed $1,000 OR 10% of contract price, whichever is LESS. (California law BPC §7159.5)

### PAGE 4 — TIMELINE & TERMS
```
• Work will start on [START DATE] and should be substantially completed within [X working days].
• All work performed by contractor is covered by a standard one-year warranty from the date of completion...
• All materials used will meet or exceed industry standards and specifications.
• All work will be performed in compliance with applicable city building and safety rules and regulations.

Additional Terms and Conditions:

Concealed or Unknown Conditions
[standard boilerplate — see below]

Right to Stop Work
[standard boilerplate — see below]
```

### PAGE 5 — SIGNATURES
```
________________  ________________  _________________
Client's Name        Signature              Date

________________  ________________  _________________
Client's Name        Signature              Date

[Right-to-cancel notice in bold box]

________________  ________________  _________________
Construction company   Signature         Date
```

### PAGES 6–12 — FIXED LEGAL BOILERPLATE
These pages are ALWAYS appended as-is. They include:
- California Home Improvement Contract legal provisions (2026)
- Subcontractor disclosure (SB 517)
- Down payment limitation
- Schedule of progress payments
- Extra work and change orders
- Right to cancel (Civil Code §§1689.5–1689.8)
- Notice of Cancellation form
- Commercial General Liability Insurance
- Workers' Compensation
- Mechanics Lien Warning
- CSLB Information Notice
- Arbitration of Disputes
- 2026 New Requirements Checklist

**DO NOT regenerate these — they are fixed and already formatted.**

---

## STANDARD BOILERPLATE TEXT (copy exactly)

### Concealed or Unknown Conditions
> The contract price is based on visible conditions at the time of the walkthrough. If, during the course of work, the Contractor encounters concealed conditions that could not have been reasonably anticipated (such as mold, termite damage, dry rot, or non-code-compliant plumbing/electrical within walls), Contractor shall notify the Client. Work in these areas will stop until a Change Order is signed to cover the additional labor and materials required to rectify the issue.

### Right to Stop Work
> Contractor reserves the right to stop all work on the project if any progress payment is not made within 48 hours of the due date/stage completion. The project timeline will be extended by the duration of the work stoppage.

### Payment Schedule Intro Paragraph
> The following is a stage payment breakdown of this construction project and figures shown as payments due does not reflect the full cost of that specific stage, but rather a reasonable progress payment system, as the project progresses:

### Right to Cancel (near signature)
> **Client may cancel this transaction at any time prior to midnight of the third business day after the date of this transaction. See the attached notice of cancellation form for an explanation of this right.**

### Warranty Bullet
> All work performed by contractor is covered by a standard one-year warranty from the date of completion. Any defects or issues arising from the work will be rectified at no additional cost during the warranty period.

---

## INPUT REQUIRED TO GENERATE A CONTRACT
When asked to create a contract, always ask for (or extract from the user's message):

1. **Client name(s)** — if two clients, both get signature lines
2. **Client address**
3. **Client phone**
4. **Client email**
5. **Project location** (if different from client address)
6. **Project title** (e.g., "Balcony Repair", "Kitchen Remodel", "Bathroom Renovation")
7. **Scope subtitle** (e.g., "related to one damaged balcony of unit #1")
8. **What's Included** — list of line items (✅)
9. **What's Not Included** — list of exclusions (❌)
10. **Materials contractor supplies**
11. **Total price**
12. **Payment stages** — milestone names and dollar amounts
13. **Start date**
14. **Estimated duration** (in working days)
15. **Date of contract**

---

## FORMATTING RULES
- Project title: **centered, bold, underlined**
- Scope subtitle: *centered, italic, underlined*
- "What's Included" header: **bold, underlined**
- "What's Not Included" header: **bold, underlined**
- "Total price" line: green color, dotted leader to amount
- "Contractor to supply" header: **bold, underlined**
- Each page has footer: Website | License | Email | Phone | Address | Page X
- Each page has "Initials: ___" at bottom right with 3 boxes
- Down payment warning must appear if down payment is included
- Right-to-cancel text must appear near signature line in bold box

---

## OUTPUT FORMAT
Generate as a Word document (.docx) using the docx skill, OR provide clean structured text the user can paste into their template.

When generating text only, clearly mark:
- `[PAGE 1]`, `[PAGE 2]`, etc.
- `[LEGAL PAGES 6–12: append existing boilerplate]`
- All variable fields in `[BRACKETS]`

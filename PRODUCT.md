# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** utilities and live-line contractors (concessionárias, empreiteiras de rede) in Piauí and the region. They buy technical material for low, medium and high voltage (BT/MT/AT) work: live-line tools, grounding, coverings, insulating ladders, measuring instruments. The person on the site is usually a buyer, engineer or field supervisor assembling a list against a work order or tender, often on a phone, and needs confirmation that the item exists, the right specification, and a fast quote.
- **Secondary:** electricians and construction companies buying infrastructure and site material (aluminum cable, PVC conduit, cable trays, poles, SPDA, PPE).
- **Also served:** industry and resellers.

## Product Purpose

The site is a catalog and quote-request channel for MAXX Elétrica Solar, a physical electrical-materials distributor in Teresina-PI. It exists to turn visits into quote requests by WhatsApp or the site form. Prices and stock are not shown (decisions 0001 and 0005); the store answers with price and lead time. Local SEO for Teresina supports discovery.

Success is measured by quote requests (form `generate_lead`) and WhatsApp clicks (`clique_whatsapp`).

## Positioning

Authorized Ritz reseller with local technical service in Teresina: a buyer gets live-line and BT/MT/AT safety equipment from a store that can be visited, with a quote in up to 24 hours, plus the complementary infrastructure lines in the same order. The store also sources items outside the catalog on request (send a photo or a list).

## Operating Context

- Buyers arrive with lists, tender items, part numbers or photos; the site supports "send your list" by WhatsApp, a form, and a browser-side quote list (lista de orçamento) that can be repeated later.
- Quote validity 7 calendar days. Free shipping to every city in Brazil, or pickup at the store. Payment by Pix, boleto, credit or debit card, always with invoice.
- Opening hours: Monday to Friday, 8h–12h and 13h–17h; Saturday and Sunday closed.
- Store: Rua Antônio Neves de Melo, 4636 B, Parque Ideal, Teresina-PI, CEP 64077-820. WhatsApp (86) 99454-0900. comercial@maxxeletricasolar.com.br for sales and quotes; sac@maxxeletricasolar.com.br for exchanges, warranty and privacy.
- The catalog comes from a spreadsheet kept by the store; MAXX supplies content and the agency (MD Solution) publishes.

## Capabilities and Constraints

- Static HTML/CSS/JS, no build step, hosted on Hostinger; the `main` branch deploys automatically. Work happens in branches and PRs (see CLAUDE.md).
- 324 products in 26 categories (12 Ritz lines, 14 complementary lines); product, category and technical-blog pages are generated.
- Quote form posts to `enviar-pedido.php` (e-mail). Customer data for the quote list stays in the browser (decision 0006).
- Measurement only with consent: Google Tag Manager with Consent Mode v2, consent banner and cookie policy (decision 0007). GA4 and Meta Pixel are not created yet.
- Tools: voltage-drop calculator, site search, share links, repeat-last-quote.
- Terminology: "Lista de orçamento" (the visitor's list), "Pedido de orçamento" (the sent request). Out-of-line products keep their page with a notice and a substitute, but leave the catalog and counts.
- Policies were not reviewed by a lawyer.

## Brand Commitments

- Name: MAXX Elétrica Solar (legal: MAXX ELETRICA SOLAR LTDA, CNPJ 61.855.316/0001-50, opened 22/07/2025).
- Design changes follow Apple Human Interface Guidelines principles (clarity, deference, grouped lists, restraint), as requested by the user.
- Imagery: realistic photos of people and work from the electrical segment, not illustrations.
- Ritz authorized-reseller status is a core trust claim; other brands (Tigre, JNG, Tramontina, Olivo, Ilumi, Copperfio, Inpol) stay discreet.
- Favicon: the "M with the sun" mark.

## Evidence on Hand

- Five customer testimonials on the home page, confirmed by the user as real.
- Store façade and store photos; Ritz catalog photos for product imagery.
- Google Business Profile for the store (reviews and map).
- Real business rules and company data above.
- No case studies, client logos, certifications beyond Ritz resale, or sales figures: do not invent them.

## Product Principles

1. Every page leads to a quote: WhatsApp or the list/form is always one step away.
2. Technical buyers first: specifications, classes and correct terminology beat marketing adjectives.
3. Proof is local and real: the physical store, Ritz authorization and real reviews; never fabricated claims.
4. No price, no stock, no promises the store cannot keep in 24 hours.
5. Respect the visitor's data: measure only with consent, keep the list in the browser.

## Accessibility & Inclusion

Many visitors are on phones in the field: readable text, large touch areas and good contrast in sunlight matter. Work already done targets WCAG AA contrast, minimum text size and touch targets (PRs #5–#7).

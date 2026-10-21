// Pure helpers: EDGAR full-text search hits and Form D primary_doc.xml parsing.
function decode(s) {
  if (s == null) return '';
  return String(s)
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .trim();
}
export function block(xml, name) {
  const m = String(xml || '').match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : '';
}
export function tag(xml, name) { return decode(block(xml, name)); }
function all(xml, name) {
  return [...String(xml || '').matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => m[1]);
}
function num(s) {
  const t = String(s || '').replace(/[$,\s]/g, '');
  if (!t || /indefinite/i.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
function bool(s) { return s === 'true' ? true : s === 'false' ? false : null; }
function title(s) {
  return String(s || '').toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

export const EXEMPTION_LABELS = {
  '04a5': 'Section 4(a)(5)',
  '06b': 'Rule 506(b)',
  '06c': 'Rule 506(c)',
  '04': 'Rule 504',
  '04_b1i': 'Rule 504(b)(1)(i)',
  '04_b1ii': 'Rule 504(b)(1)(ii)',
  '04_b1iii': 'Rule 504(b)(1)(iii)',
  '3c': 'Investment Company Act 3(c)',
  '3c.1': 'Investment Company Act 3(c)(1)',
  '3c.7': 'Investment Company Act 3(c)(7)',
};

export function parseHit(hit) {
  const s = hit._source || {};
  const adsh = s.adsh || String(hit._id || '').split(':')[0];
  const cik = String((s.ciks || [])[0] || '').replace(/^0+/, '');
  return {
    accession: adsh,
    cik,
    form: s.form || s.file_type || 'D',
    filing_date: s.file_date || null,
    biz_state: (s.biz_states || [])[0] || null,
    display_name: String((s.display_names || [])[0] || '').replace(/\s*\(CIK \d+\)\s*$/, '').trim(),
    doc: String(hit._id || '').split(':')[1] || 'primary_doc.xml',
  };
}

export function parseFormD(xml) {
  const issuer = block(xml, 'primaryIssuer');
  const addr = block(issuer, 'issuerAddress');
  const off = block(xml, 'offeringData');
  const sales = block(off, 'offeringSalesAmounts');
  const inv = block(off, 'investors');
  const fund = block(off, 'investmentFundInfo');
  const persons = all(block(xml, 'relatedPersonsList'), 'relatedPersonInfo').map((p) => {
    const n = block(p, 'relatedPersonName');
    let name = [tag(n, 'firstName'), tag(n, 'middleName'), tag(n, 'lastName')].filter((x) => x && x.toUpperCase() !== 'N/A').join(' ');
    if (name && name === name.toUpperCase()) name = title(name);
    const pa = block(p, 'relatedPersonAddress');
    return {
      name,
      roles: all(block(p, 'relatedPersonRelationshipList'), 'relationship').map(decode).filter(Boolean),
      clarification: tag(p, 'relationshipClarification') || null,
      city: title(tag(pa, 'city')) || null,
      state: tag(pa, 'stateOrCountry') || null,
    };
  }).filter((p) => p.name);
  const exemptions = all(block(off, 'federalExemptionsExclusions'), 'item').map((x) => decode(x).toLowerCase()).filter(Boolean);
  const totalRaw = tag(sales, 'totalOfferingAmount');
  const remainingRaw = tag(sales, 'totalRemaining');
  const sig = block(block(off, 'signatureBlock'), 'signature');
  const firstSaleBlock = block(block(off, 'typeOfFiling'), 'dateOfFirstSale');
  const yearBlock = block(issuer, 'yearOfInc');
  const street = [tag(addr, 'street1'), tag(addr, 'street2')].filter(Boolean).join(', ');
  const phone = tag(issuer, 'issuerPhoneNumber').replace(/[^\d+]/g, '') || null;
  const securities = Object.entries({
    equity: 'isEquityType', debt: 'isDebtType', option_warrant: 'isOptionToAcquireType',
    security_to_be_acquired: 'isSecurityToBeAcquiredType', pooled_fund_interest: 'isPooledInvestmentFundType',
    tenant_in_common: 'isTenantInCommonType', mineral_property: 'isMineralPropertyType', other: 'isOtherType',
  }).filter(([, t]) => tag(block(off, 'typesOfSecuritiesOffered'), t) === 'true').map(([k]) => k);
  return {
    company_name: tag(issuer, 'entityName'),
    entity_type: tag(issuer, 'entityType') || null,
    jurisdiction_of_incorporation: title(tag(issuer, 'jurisdictionOfInc')) || null,
    year_of_incorporation: num(tag(yearBlock, 'value')),
    incorporated_within_five_years: bool(tag(yearBlock, 'withinFiveYears')),
    street: street ? title(street) : null,
    city: title(tag(addr, 'city')) || null,
    state: tag(addr, 'stateOrCountry') || null,
    state_name: title(tag(addr, 'stateOrCountryDescription')) || null,
    zip: tag(addr, 'zipCode') || null,
    phone,
    industry_group: tag(block(off, 'industryGroup'), 'industryGroupType') || null,
    pooled_fund_type: tag(fund, 'investmentFundType') || null,
    revenue_range: tag(block(off, 'issuerSize'), 'revenueRange') || tag(block(off, 'issuerSize'), 'aggregateNetAssetValueRange') || null,
    exemptions,
    exemption_labels: exemptions.map((e) => EXEMPTION_LABELS[e] || e),
    is_amendment: bool(tag(block(off, 'newOrAmendment'), 'isAmendment')),
    date_of_first_sale: tag(firstSaleBlock, 'value') || null,
    first_sale_yet_to_occur: tag(firstSaleBlock, 'yetToOccur') === 'true',
    more_than_one_year: bool(tag(block(off, 'durationOfOffering'), 'moreThanOneYear')),
    securities_offered: securities,
    minimum_investment: num(tag(off, 'minimumInvestmentAccepted')),
    total_offering_amount: num(totalRaw),
    offering_amount_indefinite: /indefinite/i.test(totalRaw),
    total_amount_sold: num(tag(sales, 'totalAmountSold')),
    total_remaining: num(remainingRaw),
    has_non_accredited_investors: bool(tag(inv, 'hasNonAccreditedInvestors')),
    number_of_investors: num(tag(inv, 'totalNumberAlreadyInvested')),
    sales_commissions: num(tag(block(block(off, 'salesCommissionsFindersFees'), 'salesCommissions'), 'dollarAmount')),
    finders_fees: num(tag(block(block(off, 'salesCommissionsFindersFees'), 'findersFees'), 'dollarAmount')),
    signer_name: tag(sig, 'nameOfSigner') || tag(sig, 'signatureName') || null,
    signer_title: tag(sig, 'signatureTitle') || null,
    signature_date: tag(sig, 'signatureDate') || null,
    related_persons: persons,
  };
}

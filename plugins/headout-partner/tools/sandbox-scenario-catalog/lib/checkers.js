// Hardcoded per-scenario checker functions. Each takes (ctx) and returns
// either null (no match) or { variantId, evidence } (match found).
// ctx = { product, variant } for product-level checks
//     = { product, variant, inventoryDetails } for inventory-override checks

function allInputFields(variant) {
  return variant.inputFields || [];
}

const KNOWN_DATA_TYPES = ["STRING", "ENUM", "BOOL", "INT", "FLOAT", "LOCATION"];

function hasInputFieldDataType({ variant }, params) {
  for (const f of allInputFields(variant)) {
    const types = params.dataType ? [].concat(params.dataType) : null;
    const dataTypeMatch = !types || types.includes(f.dataType);
    // Custom fields almost always carry an opaque `CUSTOM_<numericId>` id —
    // the human-readable semantics (e.g. "Passport Number", "Weight") live
    // only in `name`/`description`. Matching `idIncludes` against id alone
    // silently never matches for these; search name+description too.
    const haystack = `${f.id || ""} ${f.name || ""} ${f.description || ""}`.toUpperCase();
    const idMatch = !params.idIncludes || params.idIncludes.some((s) => haystack.includes(s));
    const validationKeysMatch = !params.requireValidationKeys || params.requireValidationKeys.every((k) => f.validation && f.validation[k] !== null && f.validation[k] !== undefined);
    if (dataTypeMatch && idMatch && validationKeysMatch) {
      return { evidence: `field ${f.id} "${f.name}" (${f.dataType})`, fixture: f };
    }
  }
  return null;
}

// Matrix cell: a specific (dataType, level) combination — used to build a
// complete "every supported field level and type" fixture set, per partner
// feedback that the docs lack this.
function hasInputFieldDataTypeAndLevel({ variant }, params) {
  const f = allInputFields(variant).find((f) => f.dataType === params.dataType && f.level === params.level);
  return f ? { evidence: `field ${f.id} (${f.dataType}, ${f.level})`, fixture: f } : null;
}

// Forward-compat scenario: a dataType outside the documented enum. Partners
// hardcoding a switch/case on dataType need to know their fallback behavior
// is exercised — this catches any sandbox product that would trigger it.
function hasUnknownInputFieldDataType({ variant }) {
  const f = allInputFields(variant).find((f) => f.dataType && !KNOWN_DATA_TYPES.includes(f.dataType));
  return f ? { evidence: `unrecognized dataType ${f.dataType} on field ${f.id}`, fixture: f } : null;
}

function hasLocationField({ variant }, params) {
  for (const f of allInputFields(variant)) {
    if (f.dataType !== "LOCATION") continue;
    const values = f.validation && f.validation.values;
    const isPredefined = !!(values && (values.type === "PREDEFINED_LOCATION" || (Array.isArray(values) && values.length)));
    if (params.predefined && !isPredefined) continue;
    if (params.predefined === false && isPredefined) continue;
    if (params.requireTimingConfig) {
      const list = values && (values.value || values);
      const hasTiming = Array.isArray(list) && list.some((v) => v && v.timingConfig);
      if (!hasTiming) continue;
    }
    return { evidence: `LOCATION field ${f.id}, predefined=${isPredefined}`, fixture: f };
  }
  return null;
}

function hasInputFieldLevel({ variant }, params) {
  const f = allInputFields(variant).find((f) => f.level === params.level);
  return f ? { evidence: `field ${f.id} level=${f.level}`, fixture: f } : null;
}

// Captures how validation.values is actually shaped at the variant level
// (raw array vs {type, value} wrapper vs null) — partner feedback flagged
// this as under-documented and a source of parsing bugs.
function shapeOfValidationValues(values) {
  if (values === null || values === undefined) return "null";
  if (Array.isArray(values)) return "raw_array";
  if (typeof values === "object" && "type" in values && "value" in values) return `wrapped(${values.type})`;
  return "unknown_shape";
}

function hasValidationValuesShape({ variant }, params) {
  for (const f of allInputFields(variant)) {
    if (params.dataType && f.dataType !== params.dataType) continue;
    const shape = shapeOfValidationValues(f.validation && f.validation.values);
    if (shape === params.shape) {
      return { evidence: `field ${f.id} (${f.dataType}) validation.values shape=${shape}`, fixture: f };
    }
  }
  return null;
}

function normalizedFieldKey(f) {
  // Variant-level fields expose a string `id` (e.g. "NAME") plus a legacy
  // numeric `oldId`; inventory-level fields expose only the numeric id
  // (matching `oldId`). Compare on oldId when present so we flag genuine
  // field additions/removals, not the string-vs-numeric id-scheme quirk.
  return String(f.oldId ?? f.id);
}

function inventoryFieldsDifferFromVariant({ variant, inventoryDetails }) {
  if (!inventoryDetails || !Array.isArray(inventoryDetails.inputFields)) return null;
  const variantKeys = new Set(allInputFields(variant).map(normalizedFieldKey));
  const invKeys = new Set(inventoryDetails.inputFields.map(normalizedFieldKey));
  const added = [...invKeys].filter((k) => !variantKeys.has(k));
  const removed = [...variantKeys].filter((k) => !invKeys.has(k));
  if (added.length || removed.length) {
    return {
      evidence: `inventory ${inventoryDetails.inventoryId}: +[${added}] -[${removed}]`,
      fixture: { variantInputFields: allInputFields(variant), inventoryInputFields: inventoryDetails.inputFields },
    };
  }
  return null;
}

function hasVariantProperty({ variant }, params) {
  const props = { ...(variant.properties || {}), ...(variant.propertiesV2 || {}) };
  const key = Object.keys(props).find((k) => params.keyIncludes.some((s) => k.toUpperCase().includes(s)));
  return key ? { evidence: `property ${key}=${JSON.stringify(props[key])}`, fixture: { key, value: props[key] } } : null;
}

// `properties` (single string-valued) populated at all — needed as its own
// fixture since most variants have `properties: {}`.
function hasNonEmptyProperties({ variant }) {
  const props = variant.properties || {};
  const keys = Object.keys(props);
  return keys.length ? { evidence: `properties keys=[${keys}]`, fixture: props } : null;
}

// `propertiesV2` (string-array-valued) with a genuinely multi-value entry —
// distinct from just "propertiesV2 present", since a single-element array
// doesn't exercise the multi-value rendering case partners must handle.
function hasMultiValuePropertiesV2({ variant }) {
  const props = variant.propertiesV2 || {};
  const key = Object.keys(props).find((k) => Array.isArray(props[k]) && props[k].length > 1);
  return key ? { evidence: `propertiesV2.${key}=${JSON.stringify(props[key])}`, fixture: { key, value: props[key] } } : null;
}

function hasPriceProfileType({ variant }, params) {
  const pt = variant.pricing && variant.pricing.profileType;
  return pt === params.profileType ? { evidence: `profileType=${pt}`, fixture: variant.pricing } : null;
}

function hasNonDefaultPaxRange({ variant }) {
  const pax = variant.pax;
  if (pax && (pax.min > 1 || (pax.max && pax.max < 10))) {
    return { evidence: `pax min=${pax.min} max=${pax.max}`, fixture: pax };
  }
  return null;
}

function hasInventorySelectionType({ product }, params) {
  return product.inventorySelectionType === params.type ? { evidence: `inventorySelectionType=${product.inventorySelectionType}`, fixture: { inventorySelectionType: product.inventorySelectionType } } : null;
}

function hasProductType({ product }, params) {
  return params.types.includes(product.productType) ? { evidence: `productType=${product.productType}`, fixture: { productType: product.productType } } : null;
}

function hasSecondaryCategories({ product }) {
  const cats = product.secondaryCategories;
  return cats && cats.length ? { evidence: `secondaryCategories=[${cats.map((c) => c.id || c.name).join(",")}]`, fixture: cats } : null;
}

function hasMinVariantCount({ product }, params) {
  const count = (product.variants || []).length;
  return count >= params.min ? { evidence: `variantCount=${count}`, fixture: { variantIds: product.variants.map((v) => v.id) } } : null;
}

function hasInstantConfirmation({ product }, params) {
  return product.hasInstantConfirmation === params.value ? { evidence: `hasInstantConfirmation=${product.hasInstantConfirmation}`, fixture: { hasInstantConfirmation: product.hasInstantConfirmation } } : null;
}

function hasCashback({ variant }) {
  const cb = variant.cashback;
  return cb && cb.value > 0 ? { evidence: `cashback=${cb.value}${cb.type}`, fixture: cb } : null;
}

function hasCancellationPolicy({ variant }, params) {
  const cp = variant.cancellationPolicy || {};
  if (cp.cancellable !== params.cancellable) return null;
  if (params.requireCutoff && !cp.cancellableUpTo) return null;
  return { evidence: `cancellable=${cp.cancellable} cutoff=${cp.cancellableUpTo}`, fixture: cp };
}

module.exports = {
  hasInputFieldDataType,
  hasInputFieldDataTypeAndLevel,
  hasUnknownInputFieldDataType,
  hasLocationField,
  hasInputFieldLevel,
  hasValidationValuesShape,
  inventoryFieldsDifferFromVariant,
  hasVariantProperty,
  hasNonEmptyProperties,
  hasMultiValuePropertiesV2,
  hasPriceProfileType,
  hasNonDefaultPaxRange,
  hasInventorySelectionType,
  hasProductType,
  hasSecondaryCategories,
  hasMinVariantCount,
  hasInstantConfirmation,
  hasCashback,
  hasCancellationPolicy,
};

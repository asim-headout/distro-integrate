export const DOCS = {
  llms: "https://partner.headout.com/docs/llms.txt",
  openApiV2: "https://partner.headout.com/docs/specs/openapi-v2.yaml",
  openApiV2ApiPartner:
    "https://partner.headout.com/docs/specs/openapi-v2-api-partner.yaml",
  openApiV2Affiliate:
    "https://partner.headout.com/docs/specs/openapi-v2-affiliate.yaml",
  guide: {
    setup: "https://partner.headout.com/docs/guide/setup.md",
    walkthrough: "https://partner.headout.com/docs/guide/walkthrough.md",
    checklist: "https://partner.headout.com/docs/guide/checklist.md",
    concepts: "https://partner.headout.com/docs/guide/key-concepts.md",
    enums: "https://partner.headout.com/docs/guide/enums-and-error-codes.md",
  },
  apiPartnerV2: {
    beforeStart:
      "https://partner.headout.com/docs/api-partner/v2/before-you-get-started.md",
    products: "https://partner.headout.com/docs/api-partner/v2/products/list.md",
    product: "https://partner.headout.com/docs/api-partner/v2/products/get.md",
    inventory:
      "https://partner.headout.com/docs/api-partner/v2/inventory/list-by-tour.md",
    bookingCreate:
      "https://partner.headout.com/docs/api-partner/v2/bookings/create.md",
    bookingCapture:
      "https://partner.headout.com/docs/api-partner/v2/bookings/update.md",
    bookingGet:
      "https://partner.headout.com/docs/api-partner/v2/bookings/get.md",
    cancel:
      "https://partner.headout.com/docs/api-partner/v2/bookings/cancel.md",
    reschedule:
      "https://partner.headout.com/docs/api-partner/v2/bookings/reschedule.md",
    webhooks:
      "https://partner.headout.com/docs/api-partner/v2/webhooks/create.md",
    seatmapInventory:
      "https://partner.headout.com/docs/api-partner/v2/seatmap/inventory.md",
    seatmapValidate:
      "https://partner.headout.com/docs/api-partner/v2/seatmap/validate.md",
    seatmapIframe:
      "https://partner.headout.com/docs/api-partner/v2/seatmap/iframe.md",
  },
} as const;

export const HEADOUT_FACTS = [
  "Default to Headout API v2 unless the user explicitly asks for v1.",
  "Production server: https://www.headout.com",
  "Sandbox server: https://sandbox.api.dev-headout.com",
  "Authentication uses the Headout-Auth header. Never expose it to browser code.",
  "Use the llms.txt index before deep-diving into a specific page.",
] as const;

"use server";

import { createEnquiry, type EnquiryResult } from "@/lib/enquiries";
import { clientIpHash } from "@/lib/request";

export async function submitEnquiry(input: unknown): Promise<EnquiryResult> {
  try {
    return await createEnquiry(input, { ipHash: await clientIpHash() });
  } catch (err) {
    console.error("enquiry submission error", err);
    return { ok: false, error: "Something went wrong on our side and your enquiry was not sent. Please try again, or contact us on WhatsApp." };
  }
}

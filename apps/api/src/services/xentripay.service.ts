const BASE_URL = process.env.XENTRIPAY_BASE_URL ?? "https://test.xentripay.com";
const API_KEY = process.env.XENTRIPAY_API_KEY;
if (!API_KEY) throw new Error("XENTRIPAY_API_KEY environment variable is required");

const headers = () => ({
  "Content-Type": "application/json",
  "X-XENTRIPAY-KEY": API_KEY!,
});

const parseJsonResponse = async <T>(res: Response, action: string): Promise<T> => {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `XentriPay ${action} returned a non-JSON response (status ${res.status}): ${text.slice(0, 200) || "<empty body>"}`,
    );
  }
};

export interface InitiateCollectionParams {
  amount: number;
  phone: string; // 07XXXXXXXX
  email: string;
  name: string;
}

export const initiateCollection = async (
  params: InitiateCollectionParams,
): Promise<{ refid: string }> => {
  const msisdn = `250${params.phone.slice(1)}`;

  const res = await fetch(`${BASE_URL}/api/collections/initiate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      cname: params.name,
      amount: Math.round(params.amount),
      cnumber: params.phone,
      msisdn,
      currency: "RWF",
      pmethod: "momo",
      chargesIncluded: "true",
    }),
  });

  const json = await parseJsonResponse<{
    success?: number;
    refid?: string;
    reply?: string;
    message?: string;
    retcode?: number;
  }>(res, "collection initiation");

  if (!res.ok || json.success !== 1 || !json.refid) {
    throw new Error(json.reply ?? json.message ?? `XentriPay collection failed: ${res.status}`);
  }

  return { refid: json.refid };
};

export type XentriPayStatus = "PENDING" | "SUCCESS" | "FAILED";

export const checkCollectionStatus = async (refid: string): Promise<XentriPayStatus> => {
  const res = await fetch(`${BASE_URL}/api/collections/status/${refid}`, {
    method: "GET",
    headers: headers(),
  });

  if (!res.ok) throw new Error(`XentriPay status check failed: ${res.status}`);

  const json = await parseJsonResponse<{ status?: string }>(res, "status check");
  const s = json.status?.toUpperCase();
  if (s === "SUCCESS") return "SUCCESS";
  if (s === "FAILED") return "FAILED";
  return "PENDING";
};

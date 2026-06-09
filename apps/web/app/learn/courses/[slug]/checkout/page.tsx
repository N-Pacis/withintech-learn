"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, XCircle, Loader2, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCoursePreview } from "@/hooks/queries/courses";
import { useProfile } from "@/hooks/queries/auth";
import {
  useInitiatePayment,
  usePaymentStatus,
  pendingPaymentKey,
  type PaymentType,
  type PaymentProvider,
} from "@/hooks/queries/payments";
import { Button, Card, CardHeader, CardBody, FormField, Input, PageLoader } from "@/components/ui";
import { cn } from "@/lib/utils";

type CheckoutStep = "review" | "pay" | "waiting" | "success" | "failed";

const PROVIDERS: { value: PaymentProvider; label: string; logo: string }[] = [
  { value: "MTN", label: "MTN MoMo", logo: "/mtn-logo.svg" },
  { value: "AIRTEL", label: "Airtel Money", logo: "/airtel-logo.svg" },
];

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawType = searchParams.get("type");
  const paymentType: PaymentType = rawType === "certificate" ? "CERTIFICATE" : "COURSE_ACCESS";

  const { data: course, isLoading } = useCoursePreview(slug);
  const { data: profile } = useProfile();

  const [step, setStep] = useState<CheckoutStep>("review");
  const [phone, setPhone] = useState("");
  const [provider, setProvider] = useState<PaymentProvider>("MTN");
  const [phoneError, setPhoneError] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { mutate: initiatePayment, isPending: initiating } = useInitiatePayment();
  const { data: statusData } = usePaymentStatus(transactionId, step === "waiting");

  // Resume a pending payment session if the user closed the tab mid-flow
  useEffect(() => {
    const saved = localStorage.getItem(pendingPaymentKey(slug, paymentType));
    if (saved) {
      setTransactionId(saved);
      setStep("waiting");
    }
  }, [slug, paymentType]);

  // Transition out of waiting when status resolves; clear persisted session on terminal states
  useEffect(() => {
    if (!statusData) return;
    if (statusData.status === "PAID") {
      localStorage.removeItem(pendingPaymentKey(slug, paymentType));
      setStep("success");
    } else if (statusData.status === "FAILED" || statusData.status === "EXPIRED") {
      localStorage.removeItem(pendingPaymentKey(slug, paymentType));
      setStep("failed");
    }
  }, [statusData, slug, paymentType]);

  if (isLoading) return <PageLoader type="detail" className="p-8 lg:p-12" />;
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <p className="font-body text-sm text-danger">Course not found.</p>
        <Link href="/learn" className="font-body text-sm text-primary mt-4 hover:underline">← Back to courses</Link>
      </div>
    );
  }

  const amount = paymentType === "COURSE_ACCESS" ? course.price : course.certificatePrice;
  const label = paymentType === "COURSE_ACCESS" ? "Course Access" : "Certificate";

  function handlePay() {
    setPhoneError("");
    if (!phone.match(/^07\d{8}$/)) {
      setPhoneError("Enter a valid Rwanda phone number (07XXXXXXXX)");
      return;
    }

    initiatePayment(
      { courseId: course!.id, type: paymentType, phone, provider },
      {
        onSuccess: (data) => {
          localStorage.setItem(pendingPaymentKey(slug, paymentType), data.transactionId);
          setTransactionId(data.transactionId);
          setStep("waiting");
        },
        onError: (err) => {
          setPhoneError(err instanceof Error ? err.message : "Payment initiation failed. Please try again.");
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6 lg:p-12">
      <div className="max-w-md mx-auto">
        <Link
          href={`/learn`}
          className="inline-flex items-center gap-2 font-body text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back to courses
        </Link>

        {/* Step: Review */}
        {step === "review" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-heading font-black text-2xl text-foreground">Order Summary</h1>
              <p className="font-body text-sm text-muted mt-1">Review your purchase before paying.</p>
            </div>

            <Card shadow="sm">
              <CardBody className="flex flex-col gap-4">
                <div>
                  <p className="font-body text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
                  <p className="font-heading font-bold text-lg text-foreground">{course.title}</p>
                </div>
                <div className="border-t border-border-subtle pt-4 flex items-center justify-between">
                  <span className="font-body text-sm text-muted">Total</span>
                  <span className="font-heading font-bold text-xl text-foreground">
                    RWF {amount?.toLocaleString()}
                  </span>
                </div>
                <p className="font-body text-xs text-muted">
                  Payment is processed securely via XentriPay using MTN or Airtel Mobile Money.
                </p>
              </CardBody>
            </Card>

            <Button variant="primary" size="md" className="w-full justify-between" onClick={() => setStep("pay")}>
              Proceed to Pay <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step: Pay */}
        {step === "pay" && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-heading font-black text-2xl text-foreground">Mobile Money Payment</h1>
              <p className="font-body text-sm text-muted mt-1">
                Enter your Rwanda phone number. You&apos;ll receive a push notification to approve the payment of{" "}
                <strong className="text-foreground">RWF {amount?.toLocaleString()}</strong>.
              </p>
            </div>

            <Card shadow="sm">
              <CardBody className="flex flex-col gap-5">
                {/* Provider selector */}
                <div>
                  <p className="font-body text-xs font-medium text-foreground mb-2">Mobile Money Provider</p>
                  <div className="grid grid-cols-2 gap-3">
                    {PROVIDERS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setProvider(p.value)}
                        className={cn(
                          "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                          provider === p.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                        )}
                      >
                        <Image src={p.logo} alt={p.label} width={48} height={24} className="object-contain h-6" />
                        <p className={cn("font-body font-semibold text-sm", provider === p.value ? "text-primary" : "text-foreground")}>
                          {p.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <FormField
                  label="Phone Number"
                  htmlFor="phone"
                  hint="Rwanda number in the format 07XXXXXXXX"
                  error={phoneError}
                >
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07XXXXXXXX"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                    maxLength={10}
                  />
                </FormField>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-between"
                loading={initiating}
                disabled={!phone || initiating}
                onClick={handlePay}
              >
                Pay RWF {amount?.toLocaleString()} <ArrowRight size={16} />
              </Button>
              <p className="font-body text-xs text-muted text-center">
                By paying you accept our{" "}
                <Link href="/legal" className="text-primary hover:underline">
                  Terms &amp; Conditions
                </Link>
              </p>
              <Button variant="ghost" size="md" className="w-full" onClick={() => setStep("review")}>
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step: Waiting */}
        {step === "waiting" && (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 size={36} className="text-primary animate-spin" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">Check your phone</h2>
              <p className="font-body text-sm text-muted mt-2 max-w-xs">
                A push notification has been sent to <strong className="text-foreground">{phone}</strong>. Approve the payment on your phone to continue.
              </p>
            </div>

            {/* USSD fallback */}
            <div className="w-full rounded-2xl border border-border bg-surface-card p-5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-muted-contrast">
                <Smartphone size={15} />
                <p className="font-body text-xs font-medium uppercase tracking-wide">No prompt? Approve via USSD</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-border">
                <QRCodeSVG
                  value="tel:*182*7*1%23"
                  size={120}
                  bgColor="#ffffff"
                  fgColor="#0f0f0f"
                  level="M"
                />
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="font-body text-xs text-muted">Scan to dial, or dial manually:</p>
                <div className="font-mono font-bold text-lg text-foreground tracking-widest px-4 py-2 rounded-xl bg-surface-muted border border-border select-all">
                  *182*7*1#
                </div>
                <p className="font-body text-xs text-muted-contrast mt-1">
                  Dial the code above on your phone to approve the MTN MoMo payment.
                </p>
              </div>
            </div>

            <p className="font-body text-xs text-muted">This page updates automatically once payment is confirmed.</p>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-6 py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">Payment Successful!</h2>
              <p className="font-body text-sm text-muted mt-2 max-w-xs">
                {paymentType === "COURSE_ACCESS"
                  ? "You now have full access to this course. Time to start learning!"
                  : "Your certificate payment is confirmed. Your certificate is ready."}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              className="justify-between"
              onClick={() => router.push(
                paymentType === "CERTIFICATE" && profile?.id
                  ? `/certificates/${profile.id}/${slug}`
                  : `/learn/courses/${slug}`
              )}
            >
              {paymentType === "CERTIFICATE" ? "View My Certificate" : "Go to Course"} <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step: Failed */}
        {step === "failed" && (
          <div className="flex flex-col items-center text-center gap-6 py-12">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <XCircle size={40} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-foreground">Payment Failed</h2>
              <p className="font-body text-sm text-muted mt-2 max-w-xs">
                Your payment could not be completed. You may have declined the push notification or the session expired.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => { setStep("pay"); setTransactionId(null); }}
              >
                Try Again
              </Button>
              <Button variant="ghost" size="md" className="w-full" asChild>
                <Link href="/learn">Back to Courses</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

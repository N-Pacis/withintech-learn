"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import {
  useCreateChallenge,
  type Difficulty,
  type FunctionParam,
  type ParamType,
} from "@/hooks/queries/challenges";
import { Button, FormField, Input, TiptapEditor } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DIFFICULTY_OPTIONS: {
  value: Difficulty;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    value: "easy",
    label: "Easy",
    desc: "Straightforward, single concept",
    color:
      "border-green-300 text-green-700 bg-green-50 data-[active=true]:ring-green-300",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Requires some algorithmic thinking",
    color:
      "border-amber-300 text-amber-700 bg-amber-50 data-[active=true]:ring-amber-300",
  },
  {
    value: "hard",
    label: "Hard",
    desc: "Complex algorithms or data structures",
    color:
      "border-red-300 text-red-700 bg-red-50 data-[active=true]:ring-red-300",
  },
];

const PARAM_TYPES: ParamType[] = [
  "int",
  "float",
  "double",
  "char",
  "string",
  "int[]",
  "float[]",
  "double[]",
  "char[]",
  "string[]",
  "int[][]",
  "float[][]",
  "double[][]",
  "char[][]",
  "string[][]",
];

const RETURN_TYPES = ["void", ...PARAM_TYPES];

function FunctionSignatureBuilder({
  params,
  returnType,
  onParamsChange,
  onReturnTypeChange,
}: {
  params: FunctionParam[];
  returnType: string;
  onParamsChange: (p: FunctionParam[]) => void;
  onReturnTypeChange: (t: string) => void;
}) {
  const addParam = () => {
    onParamsChange([
      ...params,
      { name: `param${params.length + 1}`, type: "int" },
    ]);
  };

  const updateParam = (
    i: number,
    field: keyof FunctionParam,
    value: string,
  ) => {
    const next = [...params];
    next[i] = { ...next[i], [field]: value } as FunctionParam;
    onParamsChange(next);
  };

  const removeParam = (i: number) => {
    onParamsChange(params.filter((_, idx) => idx !== i));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Parameters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-body text-xs font-medium text-muted uppercase tracking-wider">
            Parameters
          </span>
          <button
            type="button"
            onClick={addParam}
            className="flex items-center gap-1 font-body text-xs text-primary hover:text-primary-dark transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {params.length === 0 && (
          <p className="font-body text-xs text-muted-contrast italic">
            No parameters — the function takes no input.
          </p>
        )}

        {params.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={p.name}
              onChange={(e) => updateParam(i, "name", e.target.value)}
              placeholder="name"
              className="flex-1 min-w-0 font-mono text-xs border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <select
              value={p.type}
              onChange={(e) =>
                updateParam(i, "type", e.target.value as ParamType)
              }
              className="font-mono text-xs border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {PARAM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeParam(i)}
              className="p-1.5 text-muted-contrast hover:text-red-500 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Return type */}
      <div className="flex items-center gap-3">
        <span className="font-body text-xs font-medium text-muted uppercase tracking-wider whitespace-nowrap">
          Return type
        </span>
        <select
          value={returnType}
          onChange={(e) => onReturnTypeChange(e.target.value)}
          className="font-mono text-xs border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        >
          {RETURN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      {(params.length > 0 || returnType !== "void") && (
        <div className="bg-editor rounded-lg px-4 py-3">
          <p className="font-mono text-xs text-muted-contrast mb-1">
            Python preview
          </p>
          <p className="font-mono text-xs text-[#C8E6C9]">
            def solution({params.map((p) => `${p.name}: ${p.type}`).join(", ")})
            {returnType !== "void" ? ` → ${returnType}` : ""}:
          </p>
        </div>
      )}
    </div>
  );
}

export default function NewChallengePage() {
  const router = useRouter();
  const createMutation = useCreateChallenge();

  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [timeLimit, setTimeLimit] = useState(5);
  const [params, setParams] = useState<FunctionParam[]>([]);
  const [returnType, setReturnType] = useState("int");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const hasDescriptionText = (html: string) =>
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = "Title is required.";
    if (!hasDescriptionText(description))
      e.description = "Problem statement is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const body: Parameters<typeof createMutation.mutateAsync>[0] = {
      title: title.trim(),
      description,
      difficulty,
      timeLimit,
    };

    if (params.length > 0) {
      body.functionParams = params;
      body.returnType = returnType;
    }

    const res = await createMutation.mutateAsync(body);
    if (res.success && res.data) {
      toast.success(
        "Challenge created — add test cases and try it in the sandbox next.",
      );
      router.push(`/admin/challenges/${(res.data as { id: string }).id}`);
    } else {
      toast.error(res.message ?? "Failed to create challenge");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/challenges"
          className="text-muted-contrast hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading font-black text-2xl text-foreground">
            New Challenge
          </h1>
          <p className="font-body text-sm text-muted mt-0.5">
            Fill in the basics and define the function signature. Starter code
            is auto-generated.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title + Problem */}
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-5">
          <FormField label="Title" required error={errors.title}>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((v) => ({ ...v, title: undefined }));
              }}
              placeholder="e.g. Kigali Bus Fare Split"
              autoFocus
            />
          </FormField>

          <FormField
            label="Problem"
            required
            hint="Write the full problem statement. Rich text, tables, links, and headings are supported."
            error={errors.description}
          >
            <TiptapEditor
              content={description}
              onChange={(html) => {
                setDesc(html);
                setErrors((v) => ({ ...v, description: undefined }));
              }}
              placeholder="Write a Rwanda-themed challenge and use tables for examples if needed."
              className="bg-white"
            />
          </FormField>
        </div>

        {/* Function Signature */}
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
          <div>
            <h2 className="font-heading font-semibold text-sm text-foreground">
              Function Signature
            </h2>
            <p className="font-body text-xs text-muted mt-1">
              Define the parameters and return type. Starter code will be
              auto-generated for all 6 languages. Leave empty to use the old
              stdin-based approach.
            </p>
          </div>
          <FunctionSignatureBuilder
            params={params}
            returnType={returnType}
            onParamsChange={setParams}
            onReturnTypeChange={setReturnType}
          />
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-xl border border-border p-5">
          <FormField label="Difficulty" required>
            <div className="grid grid-cols-3 gap-3 mt-1">
              {DIFFICULTY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  data-active={difficulty === o.value}
                  onClick={() => setDifficulty(o.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all",
                    difficulty === o.value
                      ? `${o.color} ring-2 ring-offset-1`
                      : "border-border text-muted hover:border-border-strong",
                  )}
                >
                  <span className="font-body text-sm font-medium">
                    {o.label}
                  </span>
                  <span className="font-body text-[11px] leading-snug opacity-80">
                    {o.desc}
                  </span>
                </button>
              ))}
            </div>
          </FormField>
        </div>

        {/* Time limit */}
        <div className="bg-white rounded-xl border border-border p-5">
          <FormField
            label="Time Limit"
            hint={`Maximum CPU time per test case. ${timeLimit}s is recommended for most problems.`}
          >
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={15}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="flex-1 accent-primary"
              />
              <div className="font-mono text-sm font-medium text-primary w-12 text-center bg-primary-soft rounded-lg py-1">
                {timeLimit}s
              </div>
            </div>
          </FormField>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Link href="/admin/challenges">
            <Button variant="ghost" size="md" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={createMutation.isPending}
          >
            Create & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

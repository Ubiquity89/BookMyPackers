"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestToolsPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState("");
  const [loadingText, setLoadingText] = useState("");

  async function resetQuota() {
    setLoading("reset");
    setLoadingText("Resetting quota...");

    try {
      const eventId = crypto.randomUUID();

      const res = await fetch("/api/webhook", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          eventId,
        }),
      });

      const data = await res.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Error resetting quota");
    } finally {
      setLoading("");
      setLoadingText("");
    }
  }

  async function duplicateWebhook() {
    setLoading("webhook");
    setLoadingText("Testing webhook idempotency...");

    try {
      const fixedEventId = "duplicate-webhook-test";

      await fetch("/api/webhook", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          eventId: fixedEventId,
        }),
      });

      const res = await fetch("/api/webhook", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          eventId: fixedEventId,
        }),
      });

      const data = await res.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Error testing webhook");
    } finally {
      setLoading("");
      setLoadingText("");
    }
  }

  async function generateLeads() {
    setLoading("generate");
    setLoadingText("Generating 10 concurrent leads...");

    try {
      const res = await fetch("/api/test", {
        method: "POST",
      });

      const data = await res.json();

      setMessage(data.message);
    } catch (error) {
      setMessage("Error generating leads");
    } finally {
      setLoading("");
      setLoadingText("");
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Testing Tools
        </h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>

      <div className="space-y-4">
        <button
          onClick={resetQuota}
          disabled={loading === "reset"}
          className="bg-black text-white px-4 py-2 rounded block cursor-pointer hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "reset" ? "Resetting..." : "Reset Provider Quota"}
        </button>

        <button
          onClick={duplicateWebhook}
          disabled={loading === "webhook"}
          className="bg-blue-600 text-white px-4 py-2 rounded block cursor-pointer hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "webhook" ? "Testing..." : "Test Webhook Idempotency"}
        </button>

        <button
          onClick={generateLeads}
          disabled={loading === "generate"}
          className="bg-green-600 text-white px-4 py-2 rounded block cursor-pointer hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === "generate" ? "Generating..." : "Generate 10 Concurrent Leads"}
        </button>
      </div>

      {loadingText && (
        <p className="mt-4 font-semibold text-blue-600">
          {loadingText}
        </p>
      )}

      {message && (
        <p className="mt-4 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}

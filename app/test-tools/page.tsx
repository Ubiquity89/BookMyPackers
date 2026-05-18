"use client";

import { useState } from "react";

export default function TestToolsPage() {
  const [message, setMessage] =
    useState("");

  async function resetQuota() {
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
  }

  async function duplicateWebhook() {
    const fixedEventId =
      "duplicate-webhook-test";

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
  }

  async function generateLeads() {
    const res = await fetch("/api/test", {
      method: "POST",
    });

    const data = await res.json();

    setMessage(data.message);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Testing Tools
      </h1>

      <div className="space-y-4">
        <button
          onClick={resetQuota}
          className="bg-black text-white px-4 py-2 rounded block"
        >
          Reset Provider Quota
        </button>

        <button
          onClick={duplicateWebhook}
          className="bg-blue-600 text-white px-4 py-2 rounded block"
        >
          Test Webhook Idempotency
        </button>

        <button
          onClick={generateLeads}
          className="bg-green-600 text-white px-4 py-2 rounded block"
        >
          Generate 10 Concurrent Leads
        </button>
      </div>

      {message && (
        <p className="mt-6 font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}

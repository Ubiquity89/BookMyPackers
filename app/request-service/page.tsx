"use client";

import { useState } from "react";

export default function RequestServicePage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    serviceType: "Service 1",
    description: "",
  });

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");

    const res = await fetch("/api/leads", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      setMessage(
        "Lead submitted successfully"
      );

      setFormData({
        name: "",
        phone: "",
        city: "",
        serviceType: "Service 1",
        description: "",
      });
    } else {
      setMessage(data.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6 text-black">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 border border-gray-300">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Request Service
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Full Name
            </label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-3 text-black bg-white"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Phone Number
            </label>

            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-3 text-black bg-white"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              City
            </label>

            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  city: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-3 text-black bg-white"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Service Type
            </label>

            <select
              value={formData.serviceType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  serviceType: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-3 text-black bg-white"
            >
              <option>Service 1</option>
              <option>Service 2</option>
              <option>Service 3</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Description
            </label>

            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full border border-gray-400 rounded-lg p-3 text-black bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition"
          >
            Submit Request
          </button>
        </form>

        {message && (
          <div className="mt-6 text-center font-semibold text-black">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
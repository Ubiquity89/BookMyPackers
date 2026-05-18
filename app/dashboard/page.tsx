"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchDashboard(initial = false) {
    try {
      if (initial) {
        setLoading(true);
      }

      const res = await fetch("/api/dashboard");

      const data = await res.json();

      setProviders(data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      if (initial) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-black bg-gray-200">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 p-6 text-black">
      <h1 className="text-4xl font-bold text-center mb-10">
        Provider Dashboard
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-xl p-5 border border-gray-300"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                {provider.providerName}
              </h2>

              <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-semibold">
                {provider.leadsReceived} Leads
              </div>
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-2">
                <p className="font-semibold text-gray-700">
                  Remaining Quota
                </p>

                <p className="font-bold">
                  {provider.remainingQuota}/10
                </p>
              </div>

              <div className="w-full bg-gray-300 h-3 rounded-full">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: `${
                      (provider.remainingQuota /
                        10) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <h3 className="text-lg font-bold mb-3">
              Assigned Leads
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {provider.leads.length === 0 ? (
                <div className="bg-gray-100 p-3 rounded-lg text-gray-500">
                  No leads assigned
                </div>
              ) : (
                provider.leads.map((lead: any) => (
                  <div
                    key={lead._id}
                    className="bg-gray-100 border border-gray-300 rounded-xl p-3"
                  >
                    <p className="font-bold">
                      {lead.name}
                    </p>

                    <p className="text-gray-700">
                      {lead.phone}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {lead.serviceType}
                      </span>

                      <span className="text-gray-600 text-sm">
                        {lead.city}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
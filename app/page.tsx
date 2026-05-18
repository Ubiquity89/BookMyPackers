import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-5xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4 text-black">
          Mini Lead Distribution System
        </h1>

        <p className="text-gray-700 mb-10 text-lg">
          Full Stack Developer Assignment
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/request-service">
            <div className="bg-black text-white p-6 rounded-2xl hover:scale-105 transition cursor-pointer shadow-lg">
              <h2 className="text-2xl font-bold mb-2">
                Customer Form
              </h2>

              <p>
                Submit service requests
              </p>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="bg-blue-600 text-white p-6 rounded-2xl hover:scale-105 transition cursor-pointer shadow-lg">
              <h2 className="text-2xl font-bold mb-2">
                Dashboard
              </h2>

              <p>
                View provider allocations
              </p>
            </div>
          </Link>

          <Link href="/test-tools">
            <div className="bg-green-600 text-white p-6 rounded-2xl hover:scale-105 transition cursor-pointer shadow-lg">
              <h2 className="text-2xl font-bold mb-2">
                Test Tools
              </h2>

              <p>
                Webhook & concurrency testing
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
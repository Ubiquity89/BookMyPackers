export async function POST() {
  try {
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(
        fetch("http://localhost:3000/api/leads", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: `User ${i}`,

            phone: `99999${Math.floor(
              10000 + Math.random() * 90000
            )}`,

            city: "Delhi",

            serviceType:
              i % 3 === 0
                ? "Service 1"
                : i % 3 === 1
                ? "Service 2"
                : "Service 3",

            description:
              "Concurrency test lead",
          }),
        })
      );
    }

    await Promise.all(promises);

    return Response.json({
      success: true,
      message:
        "10 concurrent leads generated",
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
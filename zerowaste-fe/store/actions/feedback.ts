const SERVER_URL = "";

export const sendFeedback = async (className: string, date: string, feedback: string) => {
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      className: className,
      date: date,
      feedback: feedback,
      returnSecureToken: true,
    }),
  });

  if (!response.ok) {
    const errorResData = await response.json();
    console.log(errorResData)
    let message = "Something went wrong!";
    throw new Error(message);
  }

  const resData = await response.json();
  console.log(resData);
};

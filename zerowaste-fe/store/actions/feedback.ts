const SERVER_URL = "";

export const sendFeedback = async (
  className: string,
  date: string,
  feedback: string,
  image: string
) => {
  const formData = new FormData();
  formData.append("className", className);
  formData.append("date", date);
  formData.append("feedback", feedback);
  formData.append("image", {
    uri: image,
    name: "feedback.jpg",
    type: "image/jpeg",
  } as any);
  console.log("Sending feedback", className, date, feedback, formData);
  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: formData,
  });
  console.log("Received response", response);

  if (!response.ok) {
    const errorResData = await response.json();
    console.log(errorResData);
    let message = "Something went wrong!";
    throw new Error(message);
  }

  const resData = await response.json();
  console.log(resData);
};

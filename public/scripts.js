addEventListener("DOMContentLoaded", (event) => {
  console.log("Content Loaded");

  const element = document.getElementById("CLICKER");
  element.addEventListener("click", () => {
    console.log("button clicked");
    fetch("/api/click", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("The current count is", data.count);

        // TODO: Put data.count on the UI somewhere
        let value = document.getElementById("VALUE");
        value.innerText = data.count;
      });
  });

  // Poll the api to get latest count
  setInterval(() => {
    fetch("/api/count")
      .then((response) => response.json())
      .then((data) => {
        let value = document.getElementById("VALUE");
        value.innerText = data.count;
      });
  }, 500);
});

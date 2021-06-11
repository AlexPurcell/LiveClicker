addEventListener("DOMContentLoaded", (event) => {
  console.log("Content Loaded");

  const element = document.getElementById("CLICKER");
  element.addEventListener("click", () => {
    console.log("button clicked");
    fetch("/api/click")
      .then((response) => response.json())
      .then((data) => console.log("Response", data));
  });
});

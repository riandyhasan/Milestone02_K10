// Scan by text
const formText = document.getElementById("formText");
const formTextContent = document.getElementById("formTextContent");
formText.onsubmit = function (event) {
  event.preventDefault();
  const body = JSON.stringify({
    text: formTextContent.value,
    detail: 1,
  });

  fetch("https://api.detax.org/detax/v1/scan_text", {
    method: "POST",
    body: body,
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
};

// Scan by image uploaded
const formImage = document.getElementById("formImage");
formImage.onsubmit = function (event) {
  event.preventDefault();
  fetch("https://api.detax.org/detax/v1/scan_image", {
    method: "POST",
    body: new FormData(formImage),
  })
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
};

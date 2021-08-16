document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  // Show thumbnail for image files
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

const formImage = document.getElementById("reportImage");
formImage.onsubmit = async function (event) {
  event.preventDefault();
  const inputFiles = document.getElementById("reportFile");

  let form = new FormData();
  form.append("detail", "1");
  form.append("file", inputFiles.files[0]);

  try {
    // Check hoax dahulu
    let response = await fetch("https://api.detax.org/detax/v1/scan_image", {
      method: "POST",
      body: form,
    });
    response = await response.json();

    const body = {
      classification: response.result.scan_result,
      description: "",
      image_url: "",
      refs: [],
      report_id: response.result.report_id,
    };

    // Kalau hoax, kirim report
    if (body.classification !== 1) {
      response = await fetch("https://api.detax.org/detax/v1/report/image", {
        method: "POST",
        body: JSON.stringify(body),
      });
      response = await response.json();
      console.log(response);
    } else {
      // Kalau tidak hoax jangan kirim report
      console.log("Ini fakta");
    }
  } catch (error) {
    console.log(error);
  }
};

const formText = document.getElementById("reportText");
const formTextContent = document.getElementById("formReportText");
formText.onsubmit = async function (event) {
  event.preventDefault();
  const body = JSON.stringify({
    text: formTextContent.value,
    detail: 1,
  });

  try {
    let response = await fetch("https://api.detax.org/detax/v1/scan_text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body,
    });
    response = await response.json();

    if (response.result.scan_result !== 1) {
      response = await fetch("https://api.detax.org/detax/v1/report/text", {
        method: "POST",
        body: JSON.stringify({
          text: formTextContent.value,
          classification: response.result.scan_result,
          description: "",
          refs: [],
        }),
      });
      response = await response.json();
      console.log(response);
    }
  } catch (error) {
    console.log(error);
  }
};

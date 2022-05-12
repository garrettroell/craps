document.addEventListener("DOMContentLoaded", function () {
  const footerName = document.getElementById("footer-name");
  const year = new Date().getFullYear();
  footerName.innerText = `Garrett Roell ${year}`;
});

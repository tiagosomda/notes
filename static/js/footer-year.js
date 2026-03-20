// Dynamically update copyright year in the footer
// Uses the current year, but never goes below the hardcoded year in the HTML
(function() {
  var copyright = document.querySelector('.copyright');
  if (copyright) {
    var yearMatch = copyright.textContent.match(/\d{4}/);
    if (yearMatch) {
      var hardcodedYear = parseInt(yearMatch[0], 10);
      var currentYear = new Date().getFullYear();
      var displayYear = Math.max(hardcodedYear, currentYear);
      copyright.textContent = copyright.textContent.replace(/\d{4}/, displayYear);
    }
  }
})();

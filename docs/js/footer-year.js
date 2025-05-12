// Dynamically update copyright year in the footer
(function() {
  var copyright = document.querySelector('.copyright');
  if (copyright) {
    var yearMatch = copyright.textContent.match(/\d{4}/);
    var year = new Date().getFullYear();
    if (yearMatch) {
      copyright.textContent = copyright.textContent.replace(/\d{4}/, year);
    } else {
      copyright.textContent = '©' + year + ' ' + copyright.textContent.replace(/^©?\s*/, '');
    }
  }
})();

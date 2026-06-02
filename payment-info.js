(function () {
  function fallbackCopy(value) {
    window.prompt('Copy this information:', value);
  }

  function copyPaymentInfo(value, successMessage) {
    if (!navigator.clipboard) {
      fallbackCopy(value);
      return;
    }

    navigator.clipboard.writeText(value)
      .then(function () {
        window.alert(successMessage);
      })
      .catch(function () {
        fallbackCopy(value);
      });
  }

  document.querySelectorAll('[data-copy-value]').forEach(function (button) {
    button.addEventListener('click', function () {
      copyPaymentInfo(button.dataset.copyValue || '', button.dataset.copySuccess || 'Copied.');
    });
  });
})();

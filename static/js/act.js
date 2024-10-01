

function createModal(id, type) {
    if (type === 'EDIT_COMMENT') {
        var modal = `
        <div id="modal`+id+`" class="modal" style="display: block;">
  <div class="modal-content">
    <span data-modal-id="`+id+`" class="close">&times;</span>
    <p>Some text in the Modal..</p>
  </div>

</div>`;
    }
    document.body.innerHTML += modal;
}


var modals = document.querySelectorAll(".modal");

// Loop through each modal
modals.forEach(function(modal) {
  // Get the unique ID of the modal
  var modalId = modal.id;

  // Get the close button within the modal
  var closeButton = modal.querySelector(".close[data-modal-id='" + modalId + "']");

  // Set up event listener for the close button
  closeButton.addEventListener("click", function() {
    // Hide the modal with the matching ID
    document.getElementById(modalId).style.display = "none";
  });

  // Set up event listener for click outside the modal
  window.addEventListener("click", function(event) {
    // Check if the user clicked outside of the modal
    if (event.target == modal) {
      // Hide the modal with the matching ID
      document.getElementById(modalId).style.display = "none";
    }
  });
});
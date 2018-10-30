$(function() {
  'use strict';
//  const maritalStatus = $('#maritalStatus')[0];
//  console.log(maritalStatus.value, maritalStatus[3].selected);
//  const mainForm = $('#mainForm');

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName('needs-validation');
  // Loop over them and prevent submission
  var validation = Array.prototype.filter.call(forms, (form) => {
    form.addEventListener('submit', (event) => {
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
      let doc = { _id: "ObjectId(57641)" };
      $('form > div').each((idx, div1) => {
        doc[div1.id] = {};
        $('> div', div1).each((idx, div2) => {
          doc[div1.id][div2.id] = {};
          $(':input', div2).each((idx, input) => {
            doc[div1.id][div2.id][input.id] = input.value;
          });
        });
      });
      console.log(doc);
    }, false);
  });
});

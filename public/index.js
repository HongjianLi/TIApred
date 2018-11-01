$(function() {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
    });
  });

// Populate the input controls:
//  const sex = $("#性别");
//  sex.val("男");
//  sex.selectpicker("render");
const initDiagnose = $("#初诊结果")[0];
//console.log(initDiagnose);
//initDiagnose.val("眼动脉梗塞, 脊髓血管疾病");
//$.each(initDiagnose, (idx, opt) => {
//  console.log(opt.value, opt.selected);
//});

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName("needs-validation");
  var validation = Array.prototype.filter.call(forms, (form) => {
    form.addEventListener("submit", (event) => {
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
      let doc = { _id: `ObjectId("57641")` };
      $("form > div").each((idx, div1) => {
        doc[div1.id] = {};
        $("> div", div1).each((idx, div2) => {
          doc[div1.id][div2.id] = {};
          $(":input", div2).each((idx, input) => {
            if (input.nodeName === "BUTTON") return;
            if (input.nodeName === "SELECT" && input.multiple) {
/*              $.each(input, (idx, opt) => {
                console.log(opt.value, opt.selected);
              });
              doc[div1.id][div2.id][input.id] = $(input).filter((idx, opt) => {
                return opt.selected;
              }).map((opt) => {
                return opt.value;
              });*/
              return;
            }
            doc[div1.id][div2.id][input.id] = input.value;
          });
        });
      });
      console.log(doc);
    }, false);
  });
});

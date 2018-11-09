$(function() {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
    });
  });
  $('.date input').datepicker({ // https://eternicode.github.io/bootstrap-datepicker/
    language: "zh-CN",
    autoclose: true,
    todayHighlight: true,
    daysOfWeekHighlighted: "0,6",
  });
//  $('#住院时间').datetimepicker({ // https://eonasdan.github.io/bootstrap-datetimepicker/
//    locale: 'zh-CN',
//  });

// Populate the input controls:
//  const sex = $("#性别");
//  sex.selectpicker('val', "女");
//  const initalDiagnosis = $("#初诊结果");
//  initalDiagnosis.selectpicker('val', ['TIA', '脑出血']);
//  const hospitalizationDate = $("#住院时间");
//  hospitalizationDate.val("2018年12月06日");

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
            if (input.nodeName === "SELECT") {
              doc[div1.id][div2.id][input.id] = $(input).selectpicker('val'); // .selectpicker('val') returns a singular value for multiple="false" and an array of values for multiple="true"
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

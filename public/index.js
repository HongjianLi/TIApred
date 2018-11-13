$(function() {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
    });
  });
  $("form select").each((idx, select) => {
    select.title = ["单选", "多选"][~~select.multiple];
  });
  $("form select").selectpicker('render');
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
  var saveButton = $('#saveButton');
  saveButton.on('click', (event) => {
    event.preventDefault();
/*    let v = new validator({
    });
    if (false
    )
      return;
    }*/
    // Disable the submit button for a while
    saveButton.prop('disabled', true);
    let emr = {};
    $("form > div").each((idx, div1) => {
      emr[div1.id] = {};
      $("> div", div1).each((idx, div2) => {
        emr[div1.id][div2.id] = {};
        $(":input", div2).each((idx, input) => {
          if (input.nodeName === "BUTTON") return;
          if (input.nodeName === "SELECT") {
            emr[div1.id][div2.id][input.id] = $(input).selectpicker('val'); // .selectpicker('val') returns a singular value for multiple="false" and an array of values for multiple="true"
            return;
          }
          emr[div1.id][div2.id][input.id] = input.value;
        });
      });
    });
    console.log(emr);
    // Post a new job with server side validation
    $.ajax({
      type: "POST",
      url: "record",
      data: emr,
      dataType: "json",
      success: (res, textStatus, jqXHR) => {
        console.log('success', res);
/*        var keys = Object.keys(res);
        // If server side validation fails, show the tooltips
        if (keys.length) {
          keys.forEach(function(key) {
            $('#' + key + '_label').tooltip('show');
          });
        } else {
          // success
        }*/
      },
    }).always(() => {
      saveButton.prop('disabled', false);
    });
  });

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.getElementsByClassName("needs-validation");
  var validation = Array.prototype.filter.call(forms, (form) => {
    form.addEventListener("submit", (event) => {
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    }, false);
  });
});

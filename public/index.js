$(function() {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
    });
  });
/*  $("#saveForm select").each((idx, select) => {
    select.title = ["单选", "多选"][~~select.multiple];
  });
  $("#saveForm select").selectpicker('refresh'); // Or use 'render'. Don't know the difference between 'render' and 'refresh'. https://developer.snapappointments.com/bootstrap-select/methods */
  $('.date input').datepicker({ // https://eternicode.github.io/bootstrap-datepicker/
    language: "zh-CN",
    autoclose: true,
    todayHighlight: true,
    daysOfWeekHighlighted: "0,6",
  });
//  $('#住院时间').datetimepicker({ // https://eonasdan.github.io/bootstrap-datetimepicker/
//    locale: 'zh-CN',
//  });
  const refreshRecords = () => {
    $.ajax({
      type: "GET",
      url: "records",
      data: { // Specify the DB query's projection.
        '基线登记.基本信息.住院号': 1,
        '基线登记.基本信息.住院日期': 1,
      },
      dataType: "json",
      success: (emrArr, textStatus, jqXHR) => {
        $("#现有记录 option").remove();
        emrArr.forEach((emr) => {
          $('#现有记录').append($('<option>', {
              text: `${emr["基线登记"]["基本信息"]["住院日期"]} ${emr["基线登记"]["基本信息"]["住院号"]}`,
              value: emr["基线登记"]["基本信息"]["住院号"],
          }));
        });
        $('#现有记录').selectpicker('refresh');
      },
    });
  };
  refreshRecords();
  $('#现有记录').on('changed.bs.select', function (event, clickedIndex, isSelected, previousValue) { // Not using lambda here to preserve this binding
    $.ajax({
      type: "GET",
      url: "record",
      data: { "基线登记.基本信息.住院号": this.value },
      dataType: "json",
      success: (emr, textStatus, jqXHR) => {
        if (!emr) return; // This should not occur.
        Object.keys(emr).forEach((div1id) => {
          if (div1id === "_id") return;
          const div1 = $(`form > div[id="${div1id}"]`);
          Object.keys(emr[div1id]).forEach((div2id) => {
            const div2 = $(`> div[id="${div2id}"]`, div1);
            Object.keys(emr[div1id][div2id]).forEach((inputid) => {
              const input = $(`:input[id="${inputid}"]`, div2);
              if (input[0].nodeName === "SELECT") {
                input.selectpicker('val', emr[div1id][div2id][inputid]);
                return;
              }
              input.val(emr[div1id][div2id][inputid]);
            });
          });
        });
      },
    });
  });

  const flatten = {
    toHeaders: (obj, headers = [], branches = []) => {
      Object.keys(obj).forEach((key) => {
        const br = branches.slice();
        br.push(key);
        if (typeof obj[key] === "string" || Array.isArray(obj[key])) {
          headers.push(br);
        } else {
          console.assert(typeof obj[key] === "object");
          flatten.toHeaders(obj[key], headers, br);
        }
      });
      return headers.map((branches) => {
        return branches.join('.');
      });
    },
    toContents: (obj, contents = []) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "string" || Array.isArray(obj[key])) {
          contents.push(obj[key]);
        } else {
          console.assert(typeof obj[key] === "object");
          flatten.toContents(obj[key], contents);
        }
      });
      return contents;
    },
  };
  let exptButton = $('#exptButton');
  exptButton.on('click', (event) => {
    event.preventDefault();
    $.ajax({
      type: "GET",
      url: "records",
//      data: {}, // If 'data' is not specified, default value is {}.
      dataType: "json",
      success: (emrArr, textStatus, jqXHR) => {
        if (!emrArr.length) return;
        saveAs(new File([
          flatten.toHeaders(emrArr[0]),
          ...emrArr.map((emr) => {
            return flatten.toContents(emr);
          })].map((line) => {
          return line.map((val) => {
            return `"${val}"`;
          }).join(',') + '\n';
        }), "现有记录.csv", {
          type: "text/plain; charset=utf-8",
        }));
      },
    });
  });

/* Use jsPDF to generate a pdf file. Chinese is supported via .text() but not .fromHTML(), so need to reconstruct the form.
  var doc = new jsPDF();
  doc.setFont('TTTGB-Medium');
  doc.text(15, 30, '脑');
  doc.fromHTML($('#saveForm').html(), 15, 15, {});
  doc.save('form.pdf');
*/

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

  let saveButton = $('#saveButton');
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
    $("form > div").each((idx, div1) => { // Selects all direct child elements. https://api.jquery.com/child-selector/
      emr[div1.id] = {};
      $("> div", div1).each((idx, div2) => {
        emr[div1.id][div2.id] = {};
        $(":input", div2).each((idx, input) => { // Selects all input, textarea, select and button elements. https://api.jquery.com/input-selector/
          if (input.nodeName === "BUTTON") return;
          if (input.nodeName === "SELECT") {
            emr[div1.id][div2.id][input.id] = $(input).selectpicker('val'); // .selectpicker('val') returns a singular value for multiple="false" and an array of values for multiple="true"
            return;
          }
          emr[div1.id][div2.id][input.id] = input.value;
        });
      });
    });
    // Post a new job with server side validation
    $.ajax({
      type: "POST",
      url: "record",
      data: emr,
      dataType: "json",
      success: (res, textStatus, jqXHR) => {
        if (res.result) {
          refreshRecords();
        }
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

});

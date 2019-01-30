$(() => {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
      $("> div", div2).each((idx, div3) => {
        $("> h5", div3).addClass("text-success");
        $("> div", div3).each((idx, div4) => {
          $("> h6", div4).addClass("text-danger");
        });
      });
    });
  });
/*  $('.selectpicker').selectpicker({
    iconBase: 'fontawesome',
  })
  $("#saveForm select").each((idx, select) => {
    select.title = ["单选", "多选"][~~select.multiple];
  });
  $("#saveForm select").selectpicker('refresh'); // Or use 'render'. Don't know the difference between 'render' and 'refresh'. https://developer.snapappointments.com/bootstrap-select/methods */
  $('.date input').datepicker({ // https://eternicode.github.io/bootstrap-datepicker/
    language: "zh-CN",
    autoclose: true,
    todayHighlight: true,
    daysOfWeekHighlighted: "0,6",
  });
//  $('#到院日期').datetimepicker({ // https://eonasdan.github.io/bootstrap-datetimepicker/
//    locale: 'zh-CN',
//  });

  const saveForm = $('#saveForm');
  const traverseForm = (form, cb) => {
    $(":input", form).each((idx, input) => {
      if (input.nodeName === "BUTTON") return;
      console.assert(input.nodeName === "INPUT" || input.nodeName === "SELECT");
      const parents = [ input.id ];
      for (let element = input.parentElement; !(element.nodeName === "FORM" && element.id === form[0].id); element = element.parentElement) {
        if (element.id !== "") {
          console.assert(element.nodeName === "DIV");
          parents.push(element.id);
        }
      }
      cb(input, parents.reverse());
    });
  };

  const refreshRecords = () => {
    $.ajax({
      type: "GET",
      url: "records",
      data: { // Specify the DB query's projection.
        '基线登记.基本信息.住院号': 1,
        '基线登记.发病情况.到院日期': 1,
      },
      dataType: "json",
      success: (recordArr, textStatus, jqXHR) => {
        $("#现有记录 option").remove();
        recordArr.forEach((record) => {
          $('#现有记录').append($('<option>', {
              text: `${record["基线登记"]["发病情况"]["到院日期"]} ${record["基线登记"]["基本信息"]["住院号"]}`,
              value: record["基线登记"]["基本信息"]["住院号"],
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
      data: {
        "基线登记.基本信息.住院号": this.value,
      },
      dataType: "json",
      success: (record, textStatus, jqXHR) => {
        if (!record) return; // This should not occur.
        // Traverse the form's DOM to refresh its input values to the record.
        traverseForm(saveForm, (input, branches) => {
          let obj = record;
          branches.forEach((branch) => {
            if (obj === undefined) return; // The condition is possible when the form's DOM is updated and the database records still conform to the old form.
            obj = obj[branch];
          });
          if (input.nodeName === "INPUT") {
            if (obj === undefined) obj = "";
            $(input).val(obj);
          } else {
            if (obj === undefined) obj = [];
            $(input).selectpicker('val', obj);
          }
        });
      },
    });
  });

  let exptButton = $('#exptButton');
  exptButton.on('click', (event) => {
    event.preventDefault();
    $.ajax({
      type: "GET",
      url: "records",
//      data: {}, // If 'data' is not specified, the default value is {}.
      dataType: "json",
      success: (recordArr, textStatus, jqXHR) => {
        if (!recordArr.length) return;
        saveAs(new File([
          // Traverse the form's DOM to generate a header row
          (() => {
            const headers = [];
            traverseForm(saveForm, (input, branches) => {
              headers.push(branches);
            })
            return headers.map((branches) => {
              return branches.join('.');
            });
          })(),
          // Traverse the form's DOM to project fields onto the record to generate content rows
          ...recordArr.map((record) => {
            const contents = [];
            traverseForm(saveForm, (input, branches) => {
              let obj = record;
              branches.forEach((branch) => {
                if (obj === undefined) return; // The condition is possible when the form's DOM is updated and the database records still conform to the old form.
                obj = obj[branch];
              });
              if (input.nodeName === "INPUT" || !input.multiple) {
                if (obj === undefined) obj = "";
                console.assert(typeof obj === "string");
                contents.push(obj);
              } else {
                if (obj === undefined) obj = [];
                console.assert(Array.isArray(obj));
                contents.push(`[${obj.map((val) => {
                  return `""${val}""`; // The csv parser accepts that data that complies with RFC RFC 4180. As a result, backslashes are not a valid escape character. If you use double-quotes to enclose fields in the CSV data, you must escape internal double-quote marks by prepending another double-quote. https://docs.mongodb.com/manual/reference/program/mongoimport/
                }).join(',')}]`);
              }
            });
            return contents;
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

  let saveButton = $('#saveButton');
  saveButton.on('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
/*    let v = new validator({
    });
    if (false
    )
      return;
    }*/
    if (!$("#saveForm.needs-validation")[0].checkValidity()) {
      $('html, body').animate({
        scrollTop: $('#saveForm.needs-validation :input[required]').filter((idx, input) => { // Find required inputs that have no value inputted
          return !input.checkValidity();
        }).first().parent().offset().top,
      });
      $('#saveForm').addClass("was-validated");
      return;
    }
    // Disable the submit button for a while
    saveButton.prop('disabled', true);
    // Traverse the form's DOM to generate a document to be inserted.
    const record = {};
    traverseForm(saveForm, (input, branches) => {
      let obj = record;
      const key = branches.pop();
      branches.forEach((branch) => {
        if (obj[branch] === undefined) obj[branch] = {};
        obj = obj[branch];
      });
      if (input.nodeName === "INPUT") {
        obj[key] = input.value;
      } else {
        obj[key] = $(input).selectpicker('val'); // .selectpicker('val') returns a singular value for multiple="false" and an array of values for multiple="true"
      }
    });
    // Post a new record with server side validation
    const saveButtonModal = $('#saveButtonModal');
    $.ajax({
      type: "POST",
      url: "record",
      data: {
        record: JSON.stringify(record), // JSON.stringify() is better, though not necessary, because jquery.ajax() omits object properties of empty array value when the content type is the default application/x-www-form-urlencoded. Using stringify() will preserve all fields. https://bugs.jquery.com/ticket/6481
      },
      dataType: "json",
      success: (res, textStatus, jqXHR) => {
        if (res.result) {
          saveButtonModal.find('.modal-title').text("保存成功");
          saveButtonModal.find('.modal-body').text(JSON.stringify(res.result));
          refreshRecords();
        } else if (res.errmsg) {
          saveButtonModal.find('.modal-title').text("保存失败");
          saveButtonModal.find('.modal-body').text(res.errmsg);
        }
        saveButtonModal.modal('show');
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

$(function() {
  "use strict";

  // Apply colors to form headers.
  $("form > div").each((idx, div1) => {
    $("> h3", div1).addClass("text-primary");
    $("> div", div1).each((idx, div2) => {
      $("> h4", div2).addClass("text-info");
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
      success: (recordArr, textStatus, jqXHR) => {
        $("#现有记录 option").remove();
        recordArr.forEach((record) => {
          $('#现有记录').append($('<option>', {
              text: `${record["基线登记"]["基本信息"]["住院日期"]} ${record["基线登记"]["基本信息"]["住院号"]}`,
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
/*      // Traverse the record to populate the form's DOM. This approach has a problem that when the DOM has been added more fields which are not present in the record, those fields will not be resetted to empty but keep their existing values.
        Object.keys(record).forEach((div1id) => {
          if (div1id === "_id") return;
          const div1 = $(`form > div[id="${div1id}"]`);
          Object.keys(record[div1id]).forEach((div2id) => {
            const div2 = $(`> div[id="${div2id}"]`, div1);
            Object.keys(record[div1id][div2id]).forEach((inputid) => {
              const input = $(`:input[id="${inputid}"]`, div2);
              if (input[0].nodeName === "SELECT") {
                input.selectpicker('val', record[div1id][div2id][inputid]);
                return;
              }
              input.val(record[div1id][div2id][inputid]);
            });
          });
        });*/
        // Traverse the form's DOM to refresh its input values to the record.
        $("#saveForm > div").each((idx, div1) => { // Selects all direct child elements. https://api.jquery.com/child-selector/
          if (record[div1.id] === undefined) record[div1.id] = {};
          $("> div", div1).each((idx, div2) => {
            if (record[div1.id][div2.id] === undefined) record[div1.id][div2.id] = {};
            $(":input", div2).each((idx, input) => { // Selects all input, textarea, select and button elements. https://api.jquery.com/input-selector/
              if (record[div1.id][div2.id][input.id] === undefined) {
                record[div1.id][div2.id][input.id] = "";
              }
              if (input.nodeName === "BUTTON") return;
              if (input.nodeName === "SELECT") {
                $(input).selectpicker('val', record[div1.id][div2.id][input.id]);
                return;
              }
              $(input).val(record[div1.id][div2.id][input.id]);
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
//      data: {}, // If 'data' is not specified, the default value is {}.
      dataType: "json",
      success: (recordArr, textStatus, jqXHR) => {
        if (!recordArr.length) return;
        saveAs(new File([
          flatten.toHeaders(recordArr[0]),
          ...recordArr.map((record) => {
            return flatten.toContents(record);
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
    let record = {};
    $("#saveForm > div").each((idx, div1) => { // Selects all direct child elements. https://api.jquery.com/child-selector/
      record[div1.id] = {};
      $("> div", div1).each((idx, div2) => {
        record[div1.id][div2.id] = {};
        $(":input", div2).each((idx, input) => { // Selects all input, textarea, select and button elements. https://api.jquery.com/input-selector/
          if (input.nodeName === "BUTTON") return;
          if (input.nodeName === "SELECT") {
            record[div1.id][div2.id][input.id] = $(input).selectpicker('val'); // .selectpicker('val') returns a singular value for multiple="false" and an array of values for multiple="true"
            return;
          }
          record[div1.id][div2.id][input.id] = input.value;
        });
      });
    });
    // Post a new record with server side validation
    const saveButtonModal = $('#saveButtonModal');
    $.ajax({
      type: "POST",
      url: "record",
      data: record,
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

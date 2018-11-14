var shortlist;
var ttPlaceholder = "#timetable"
draw_table()
draw_timetable(ttPlaceholder)

var clearButton = document.getElementById("clearButton")
clearButton.addEventListener("click", clear_all)
clearButton.addEventListener("click", function () {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.reload(tabs[0].id);
  });
  window.close()
})

chrome.storage.onChanged.addListener((changed, where) => {
  redraw_table()
  redraw_timetable(ttPlaceholder)
})

function create_table(data) {
  var table = document.createElement("TABLE")
  var headings = table.insertRow()
  headings.insertCell()
  headings.insertCell().innerHTML = "Index"
  headings.insertCell().innerHTML = "Course"
  headings.insertCell().innerHTML = "Title"
  headings.insertCell().innerHTML = "Day"
  headings.insertCell().innerHTML = "Time"
  headings.insertCell().innerHTML = "Coreq"
  console.log(Object.keys(data))

  for (each of Object.keys(data)){
    var row = table.insertRow()
    var remove_button = document.createElement("button")
    remove_button.innerHTML = "&mdash;"
    remove_button.dataset.course = each
    remove_button.addEventListener("click", remove_course)
    remove_button.addEventListener("click", remove_course_on_main)

    row.insertCell().appendChild(remove_button)

    row.insertCell().innerHTML = data[each]["index"]
    row.insertCell().innerHTML = each
    row.insertCell().innerHTML = data[each]["name"]

    // shorten meet days
    var meet = data[each]["meet"];
    var srtMeet = [];
    for (var day of meet) {
	     srtMeet.push(day.slice(0,3));
    };
    row.insertCell().innerHTML = srtMeet.join(", ");
    row.insertCell().innerHTML = data[each]["time"]["start"]
    row.insertCell().innerHTML = data[each]["coreq"]

  }
  return table
};

function draw_table() {
  chrome.storage.local.get(null, (result) => {
    console.log(result)
    shortlist = result["course"];
    tableShortList = create_table(shortlist);
    document.getElementById("tableShortlist").appendChild(tableShortList)
  })
}

function redraw_table() {
  var table = document.getElementById("tableShortlist")
  table.removeChild(table.firstChild)
  draw_table()
}


function draw_timetable(placeholder) {

  var timetable = new Timetable()
  var renderer = new Timetable.Renderer(timetable)

  timetable.addLocations(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"])
  timetable.useTwelveHour()
  chrome.storage.local.get(null, function (result) {
    let shortlist = result.course;
    for (let each in shortlist) {
      let data = shortlist[each];
      console.log(data)
      for (let day of data["meet"]) {
        timetable.addEvent(data["name"] +" | "+ data["course"], day, new Date(2018, 6, 1, data["time"]["start_hr"], data["time"]["start_min"]), new Date(2018, 6, 1, data["time"]["end_hr"], data["time"]["end_min"]), {url: data["link"]});
      };
      renderer.draw(placeholder)
    };
  });
}

function redraw_timetable(timetable) {
  var placeholder = document.querySelector(timetable)
  placeholder.innerHTML = ""
  draw_timetable(timetable)
  console.log("redraw")
}

function remove_course_on_main(event) {
  let course = this.dataset.course

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {remove: course});
  });
}

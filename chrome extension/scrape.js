chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    course = request.remove;
    remove_course_from_extension(course);
  });


var list;
// chrome.storage.local.clear()
chrome.storage.local.get(null, (result) => {
  list = result["course"];
  console.log(result)
  var removes = get_removes(list)
  insert_button(removes)
  chrome.storage.onChanged.addListener(function(change, where){
    console.log(change, where)
    })
  });

function get_data(link) {

  $.get(link, function(response) {
    // get name and course code
    var name_re = /<span class="resource-name">(.+) \((.{4}\d{6})\)<\/span>/gm;
    var all, name, course, rest;
    [all, name, course, ...rest] = name_re.exec(response);

    // get any alerts
    var alert_re = /<div class="message .+>\n+.+\n.+<strong>(.+)<\/strong><br>/gm;
    try {
      var alert = alert_re.exec(response)[1];
    } catch {
      var alert = null;
    }

    // get school
    var school_re = /<hr \/><strong>School<\/strong><br \/> (.+)\n/gm;
    var school = school_re.exec(response)[1];

    // get department
    var department_re = /<hr \/><strong>Department<\/strong><br \/> (.+)\n/gm;
    var department = department_re.exec(response)[1]

    // get professor
    var prof_re = /<a class="presenceLink".+\n+.+>(.+)&nbsp;<.+>/gm;
    try {
      var prof = prof_re.exec(reponse)[1]
      cosole.log(prof)
    } catch {
      var prof = null
    }

    // get term
    var term_re = /<hr \/><strong>Term<\/strong><br \/> (\w+ \d+)/gm;
    var term = term_re.exec(response)[1];

    // get max class size
    var max_size_re = /<hr \/><strong>Maximum Size<\/strong><br \/> (\d+)/gm;
    var max_size = max_size_re.exec(response)[1]

    // get meeting days
    var meet_re = /<li class="meet (monday|tuesday|wednesday|thursday|friday)">/gm;
    var meet = [];
    while ((match = meet_re.exec(response)) !== null) {
      meet.push(match[1].toUpperCase())
    }

    // get meeting time
    var time_re = /<span class="time" > ((\d+):(\d+) (a.m.|p.m.)) - ((\d+):(\d+) (a.m.|p.m.)) <\/span>/gm;
    try {
      [all, start, start_hr, start_min, start_ampm, end, end_hr, end_min, end_ampm, ...rest] = time_re.exec(response);
      if (start_ampm === "p.m.") {
        if (start_hr !== "12") {
          start_hr = Number(start_hr) + 12;
        } else {
          start_hr = 12;
        }

      };
      if (end_ampm === "p.m.") {
        if (end_hr !== "12") {
          end_hr = Number(end_hr) + 12;
        } else {
          end_hr = 12;
        }
      };
    } catch {
      [start, start_hr, start_min, start_ampm, end, end_hr, end_min, end_ampm] = [null, null, null, null, null, null, null, null]
    }
    time = {
      "start": start,
      "start_hr": start_hr,
      "start_min": start_min,
      "end": end,
      "end_hr": end_hr,
      "end_min": end_min,
    }

    // get meeting location
    var location_re = /<span class="location" > (.+) <\/span>/gm;
    try {
      var location = location_re.exec(response)[1];
    } catch {
      var location = "By Arrangement"
    }

    // get number of credits
    var credits_re = /<hr \/><strong>Credits<\/strong><br \/> (.+)/gm;
    var credits = credits_re.exec(response)[1]

    // get level
    var level_re =/<hr \/><strong>Level<\/strong><br \/> (.+)/gm;
    var level = level_re.exec(response)[1]

    // get Description
    var description_re = /<hr \/><strong>Description<\/strong><br \/> <b><\/b><br>\n\s+(.+)/gm;
    var description = description_re.exec(response)[1];

    // get Prerequisites
    var prereq_re = /<hr \/><strong>Prerequisites<\/strong><br \/> (.+)/gm;
    try  {
      var prereq = prereq_re.exec(response)[1]
    } catch {
      var prereq = null
    }

    // get Corequisites
    var coreq_re = /<hr \/><strong>Corequisites<\/strong><br \/> (.+)/gm;
    try {
      var coreq = coreq_re.exec(response)[1]
    } catch {
      let coreq_re = /Must register for the co-requisite course (.+)<\/strong>/gm;
      try {
        var coreq = coreq_re.exec(response)[1]
      } catch {
        var coreq = null;
      }
    }
    // get Cross Listings
    var cross_re = /<hr \/><strong>Cross Listings<\/strong><br \/>\n+.+\n+.+\n+.\s+Also offered this term as\n.+\n+\s+(.+)/gm;
    try {
      var cross = cross_re.exec(response)[1];
    } catch {
      var cross = null
    }

    // get Course Index
    var index_re = /<hr \/><strong>Course Index<\/strong><br \/> (.+)/gm;
    var index = index_re.exec(response)[1];

    // get frequency
    var freq_re = /<hr \/><strong>Frequency<\/strong><br \/> (.+)/gm
    var freq = freq_re.exec(response)[1];

    // get repeatable
    var repeat_re = /<hr \/><strong>Repeatable<\/strong><br \/> (.+)/gm;
    var repeat = repeat_re.exec(response)[1];

    var data = {
      "link": link,
      "name": name,
      "course": course,
      "alert": alert,
      "school": school,
      "department": department,
      "prof": prof,
      "term": term,
      "max_size": max_size,
      "meet": meet,
      "time": time,
      "location": location,
      "credits": credits,
      "level": level,
      "description": description,
      "prereq": prereq,
      "coreq": coreq,
      "cross": cross,
      "index": index,
      "freq": freq,
      "repreat": repeat
    };

    chrome.storage.local.get(null, function(result) {
      let list = result["course"]
      list[course] = data
      chrome.storage.local.set({"course": list}, function() {
        console.log(document.querySelector(`[data-href="${link}"]`))
        document.querySelector(`[data-href="${link}"]`).dataset.course = course
      })

    })
  });

};

function add_course(event) {
  link = this.dataset.href;

  console.log(link)

  get_data(link)
  this.removeEventListener("click", add_course)
  this.addEventListener("click", remove_course);
  this.innerHTML = "<strong>  &raquo; Remove from Shortlist</strong>";
  return event;
}

function remove_course(event) {
  course = this.dataset.course
  delete list[course]
  chrome.storage.local.get(null, function(result) {
    let list = result["course"]
    delete list[course]
    chrome.storage.local.set({course: list}, function() {console.log("Removed: " + course);})
  })


  this.removeEventListener("click", remove_course)
  this.addEventListener("click", add_course)
  this.innerHTML = "<strong>  &raquo; Add to Shortlist</strong>";
}

function clear_all() {
  chrome.storage.local.remove("course", function() {
    chrome.storage.local.set({"course": {}})
    console.log("List Cleared");
  })
}

function remove_course_from_extension(course) {
  var button = document.querySelector(`[data-course="${course}"]`)
  console.log(button)
  button.removeEventListener("click", remove_course)
  button.addEventListener("click", add_course)
  button.innerHTML = "<strong>  &raquo; Add to Shortlist</strong>";

}

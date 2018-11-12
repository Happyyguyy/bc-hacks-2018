var list;
// chrome.storage.sync.clear()
chrome.storage.sync.get(null, (result) => {
  list = result["course"];
  console.log(list);
  var removes = get_removes(list)
  insert_button(removes)
});


function get_data(href) {

  var link = "https://services.bc.edu/courseinfosched/" + href
  $.get(link, function(response) {

    // get name and course code
    var name_re = /<span class="resource-name">(.+) \((.{4}\d{6})\)<\/span>/gm;
    var all, name, course, rest;
    [all, name, course, ...rest] = name_re.exec(response);

    // get any alerts
    var alert_re = /<div class="message .+>\n+.+\n.+<strong>(.+)<\/strong><br>/gm;
    var alert = alert_re.exec(response)[1];

    // get school
    var school_re = /<hr \/><strong>School<\/strong><br \/> (.+)\n/gm;
    var school = school_re.exec(response)[1];

    // get department
    var department_re = /<hr \/><strong>Department<\/strong><br \/> (.+)\n/gm;
    var department = department_re.exec(response)[1]

    // get professor
    var prof_re = /<a class="presenceLink".+\n+.+>(.+)&nbsp;<.+>/gm;
    var prof = prof_re.exec(response)[1]

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
      meet.push(match[1])
    }

    // get meeting time
    var time_re = /<span class="time" > (\d+:\d+) (a.m.|p.m.) - (\d+:\d+) (a.m.|p.m.) <\/span>/gm;
    var all, start, start_ampm, end, end_ampm, rest;
    [all, start, start_ampm, end, end_ampm, ...rest] = time_re.exec(response);
    time = {
      "start": start,
      "start_ampm": start_ampm,
      "end": end,
      "end_ampm": end_ampm
    }

    // get meeting location
    var location_re = /<span class="location" > (.+) <\/span>/gm;
    var location = location_re.exec(response)[1];

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
    if (prereq_re.test(response)) {
      var prereq = prereq_re.exec(response)[1];
    } else { var prereq = null};

    // get Corequisites
    var coreq_re = /<hr \/><strong>Corequisites<\/strong><br \/> (.+)/gm;
    if (coreq_re.test(response)) {
      var coreq = coreq_re.exec(response)[1];
    } else { var coreq = null};

    // get Cross Listings
    var cross_re = /<hr \/><strong>Cross Listings<\/strong><br \/> (.+)/gm;
    if (cross_re.test(response)) {
      var cross = cross_re.exec(response)[1];
    } else { var cross = null};

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
      "link": href,
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


    list[course] = data
    chrome.storage.sync.set({course: list})
    console.log(list)
  });

};

function click_add(event) {
  href = event.path[1].dataset.href;
  console.log(href)

  get_data(href)
  return event;
}

function remove_key(course) {
  chrome.storage.sync.remove(`course[${course}]`)
}

function clear_all() {
  chrome.storage.sync.remove("course")
}

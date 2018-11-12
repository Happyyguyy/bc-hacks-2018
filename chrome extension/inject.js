
function insert_button(exceptions) {
  let removes = exceptions
  var courses = document.getElementsByClassName("course");
  var count = 1;
  for (each of courses) {
    // find button destination
    desc = each.getElementsByTagName("td")[0];

    // get link of course info page
    var href = desc.getElementsByTagName("a")[0].getAttribute("href");

    // create button to click to add to list
    var add_to_list = document.createElement("a");
    add_to_list.setAttribute("id", count);
    add_to_list.setAttribute("data-href", href);
    add_to_list.setAttribute("class", "add_button");
    if (Object.keys(removes).indexOf(href) !== -1) {
      add_to_list.addEventListener("click", remove_key)
      add_to_list.dataset.course = removes[href]
      add_to_list.innerHTML += "<strong>  &raquo; Remove from Shortlist</strong>";
    } else {
      add_to_list.addEventListener("click", click_add);
      add_to_list.innerHTML += "<strong>  &raquo; Add to Shortlist</strong>";
    }
    // add_to_list.

    // append element to DOM
    desc.appendChild(add_to_list);

    count ++;
  };

};

function get_removes(data) {
  var removes = {};
  for (var each in data) {
    // course: href
    removes[data[each]["link"]] = each
  };
  console.log(removes)
  return removes
}

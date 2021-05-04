/*
  Implements the logic for creating, viewing and editing events by clicking on the wanted date on a calendar.
*/

// All days of the week
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      // Current year
      year = new Date().getFullYear(),
      // All months and their amount of days.
      months = {
        1: ['January', 31], 
        2: ['February', year % 4 === 0 ? 29: 28],
        3: ['March', 31],
        4: ['April', 30],
        5: ['May', 31],
        6: ['June', 30],
        7: ['July', 31],
        8: ['August', 31],
        9: ['September', 30],
        10: ['October', 31],
        11: ['November', 30],
        12: ['December', 31]
      },
      csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value,
      // days of the week abreviated.
      abrev = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

// When page renders
document.addEventListener('DOMContentLoaded', () => {

    // Add every month as a link in the month navbar.
    // On clicking the link, the calendar will be rendered for the clicked month.
    let res = '';
    Object.keys(months).forEach( month => {
      res += 
      `<li class="nav-item col-sm-2 text-center">
          <a id=link-${months[month][0]} onclick=load_calendar(${month})  
          class="nav-link active" aria-current="page" href="javascript:;">
            ${months[month][0]}
          </a>
      </li>`;
    });
    document.querySelector('#months').innerHTML = res;

    // If window decrease to under 800px, change the days of the week names to its abbreviated versions.
    // If it increases to over 800px, to the opposite.
    window.addEventListener('resize', function(event) {
      if(window.innerWidth < 800)
        document.querySelectorAll('.col.day.title').forEach(e => {
          e.textContent = abrev[parseInt(e.id)];
        })
      else
        document.querySelectorAll('.col.day.title').forEach(e => {
          e.textContent = days[parseInt(e.id)];
        })

  }, true);
    // By default, load January when the page is rendered.
    load_calendar(1);
  
});

// helper function to make a GET request to the url provided, returning its result and handling its possible errors.
async function get_events(url) {

  const request = new Request(
    url,
    {headers: {'X-CSRFToken': csrftoken}}
  );

  const tmp = await fetch(request, {
    method: 'GET',
    mode: 'same-origin'
  }).then(response => response.json())
  .then(result => {
    if(result.error)
      handleError(result.error, '#error-alert-body');
      else
        return result;
  });

  return tmp;

}

// Load calendar for given month
// Triggered by clicking on month in collapsable navbar.
async function load_calendar(month) {

    // get current day and month.
    const date = new Date(),
          curr_day = date.getDate(),
          curr_month = date.getMonth();
    // get the day of the week of the first day in given month.
    let day = new Date(year, month-1, 1).getDay();

    // Add the days of the week starting from the first day of month's dys of week.
    document.querySelectorAll('.col.day').forEach(div => {
      div.id = day % 7;
      div.innerHTML = days[day++ % 7];
    });

    let res = '';
    // Add all days of month in rows of seven.
    for(var i = 1; i<=months[month][1]; i++) {
      if(i % 7 == 1) {
        if(i != 1) res+= `</div>`;
        res += `<div class="row justify-content-start">`;
      }
      // If the days of month is older than current date, make text striked through.
      res += 
      `<a id="d-${i}" class="col day" onclick="load_day(${i}, ${month})" href="javascript:;"> 
        <span ${(curr_month  > month - 1 || month - 1 === curr_month && curr_day > i ) && 'style="text-decoration: line-through;"'}>${i}
      </a>`;
    }

    document.querySelector('#events').innerHTML = res;

    // Change current loaded month to given month 
    document.querySelector('#month-name').innerHTML = `<h4> ${months[month][0]} </h4>`;

    // get all events in given month.
    const events = await get_events(`/eventsMonth/${month}`) || [];

    // If there is an event in day of month make it green.
    events.forEach( event => {
      let day = parseInt(event.date.split(" ")[1]);
      document.querySelector(`#d-${day}`).style.backgroundColor = 'green';
    });

}

// Load modal with given day's events.
// Triggered by clicking on any day of month.
async function load_day(day, month) {

  // get all events of the day given
  const events = await get_events(`/eventsDay/${month}/${day}`) || [];

  // get day of week of the given day
  let date = new Date(day, month, year).getDay(), 
      res = `<strong> ${days[date]}, ${months[month][0]} ${day}, ${year} </strong> <hr> <h3> Events today </h3>`;
 
  // If there are any events in the day
  if(events.length) {
    res += `<div class="list-group">`;
    // render each event as a list item
    // clicking on a event should render all iformation about it
    events.forEach(event => {
      res += `
      <div onclick="load_event(${event.id})" class="event list-group-item list-group-item-action">
        <div class="d-flex w-100 justify-content-between">
          <h3 class="mb-1"> ${event.title} </h3>
        </div>
        <p class="mb-1"> Host: ${event.host[0]} </p>
        <small class="text-muted"> Time: ${event.time}</small>
      </div>`;
    });
    res += `</div>`;
  }
  // No events in day
  else 
    res = '<h4> No events in this date. </h4>'

  // Add events to document
  document.querySelector(`#modal1-info`).innerHTML = res;

  // Clicking on 'Create new Event' calls 'create-event' url with the given day as url parameter
  document.querySelector('#create-event-btn').addEventListener('click', 
      ()=> 
          location.href = `/create-event?day=${day}&month=${month}&year=${year}`
  );

  // Activate modal.
  $('#modal').modal('toggle')

}

// Load modal2 with given event.
// Triggered by clicking on any event in the event list of a day.
async function load_event(event_id) {

  // Get all information about the event
  const event = await get_events(`/event/${event_id}`);

  // Hide the fields rendered by editEvent()
  hideForm();
  
  // Remove all items rendered in previous calls to this function
  document.querySelectorAll(`.inserted-event`).forEach(el => el.remove());

  // Render every attribute of event in its designated element.
  for(attribute in event) {
    // Render participants and host as table
    if(attribute === 'participants') {
      let res ='';
      event[attribute].forEach(usr => {
        const [usr_name, usr_id] = usr.split(", ");
        res += `<tr id=tr-${usr_id} class="inserted-event">
        <td><a href="/profile/${usr_id}" style="display:block;text-decoration:none;"> ${usr_name} </a> </td> 
        <td> Participant  </td>
      </tr>`;
      });
      document.querySelector(`#event-${attribute}`).innerHTML += res;

    }
    else if(attribute === 'host') {
      const [usr_name, usr_id] = event[attribute];
      document.querySelector(`#event-${attribute}`).innerHTML = `<a href="/profile/${usr_id}" style="display:block;text-decoration:none;"> ${usr_name} </a>`;
    }
    else
      document.querySelector(`#event-${attribute}`).textContent = event[attribute];
  }
  // Render address field only if address is not null
  if(event['address']) 
    document.querySelector(`#address-div`).style.display = 'block';
  else 
    document.querySelector(`#address-div`).style.display = 'none';

  // If current user is the host of the event, display edit button
  if(event['host'][0] !== document.querySelector('#curr_username').textContent.trim()) {
    document.querySelector(`#edit-event-btn`).style.display = 'none';
    document.querySelector(`#delete-event-btn`).textContent = 'Leave Event';
  }

  else {
    document.querySelector(`#edit-event-btn`).style.display = 'inline-flex';
    document.querySelector(`#delete-event-btn`).textContent = 'Delete Event';
  }
  

  // Activate modal 2.
  $('#modal').modal('hide');
  $('#modal2').modal('show');
}
// Load fields for editing the currently loaded event.
// Triggered by clicking the #edit-event-btn button
function editEvent() {
  // render a delete column in the participants table 
  document.querySelector(`#participants-head`).innerHTML += 
    `<td class="remove-later"> <strong> Delete <strong> </td>`;
  document.querySelectorAll(`.inserted-event`).forEach(
      el => el.innerHTML += `<td class="remove-later"> <input class="form-check-input" value="${el.id.split('-')[1]}" type="checkbox" value=""> </td>`
      );
  // render the text input field for adding participants 
  document.querySelector(`#participant-input`).style.display = 'block';

  // Change #edit-event-btn button color and onClick
  const btn = document.querySelector(`#edit-event-btn`);
  btn.textContent = 'Save Changes!';
  btn.style.backgroundColor = '#007bff';
  btn.onclick = saveEvent;
}

function deleteEvent() {
  event_id = document.querySelector('#event-id').textContent;
  const request = new Request(
    `/event/${event_id}`,
    {headers: {'X-CSRFToken': csrftoken}}
  );

  fetch(request, {
    method: 'DELETE',
    mode: 'same-origin',
  }).then(response => response.json())
  .then(result => {
    if(result.success) {
      // reload the event
      const date = document.querySelector('#event-date').textContent.split(' '),
      day = parseInt(date[1]);
      for (var i=1; i<=12; i++) if(months[i][0].includes(date[0])) break;

      load_calendar(i);
      load_day(day, i);
      // Hide both modals
      $('#modal').modal('hide');
      $('#modal2').modal('hide');
    }
    else {
      // display error messages
      handleError(result.error, '#error-alert-modal');
    }
  });
}

// Undo all changes made in EditEvent()
// Triggered by load_event()
function hideForm() {
  const btn = document.querySelector(`#edit-event-btn`);
  btn.textContent = 'Edit Participants';
  btn.style.backgroundColor = '#343a40';
  btn.onclick = editEvent;
  document.querySelector(`#participant-input`).style.display = 'none';

  document.querySelector(`#delete-event-btn`).onclick = deleteEvent;

  document.querySelectorAll(`.remove-later`).forEach(el => el.remove());
}

// PUT the event changes
// Triggered by clicking the #edit-event-btn after after EditEvent() has been called
function saveEvent() {
  event_id = document.querySelector('#event-id').textContent;
  const request = new Request(
    `/event/${event_id}`,
    {headers: {'X-CSRFToken': csrftoken}}
  );

  // Get the values (user.id) of all checked participants 
  checked = [];
  document.querySelectorAll('.form-check-input').forEach(
    el => {if(el.checked) checked.push(el.value);}
  )

  fetch(request, {
    method: 'PUT',
    mode: 'same-origin',
    body: JSON.stringify({
      del: checked,
      add: document.querySelector('#new-participants').value // get the value of the input field
    })
  }).then(response => response.json())
  .then(result => {
    if(result.success) {
      // reload the event
      load_event(event_id);
    }
    else {
      // display error messages
      handleError(result.error, '#error-alert-modal');
    }
  });
}

// Handle possible errors on fetching data.
function handleError(message, el) {
  const tmp = document.querySelector(el)
  tmp.innerText = message;
  tmp.style.display = 'grid';
  tmp.addEventListener('click', () => {
    tmp.innerText = '';
    tmp.style.display = 'none';
  });
  tmp.scrollIntoView(false);
}
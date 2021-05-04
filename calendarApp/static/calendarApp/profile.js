/*
  Implements the logic for editing the profile's bio and avatar.
*/
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  // When page renders.
  document.addEventListener('DOMContentLoaded', () => {

    // if current user if the profile's owner, add ability to edit bio on click.
    const btn = document.querySelector(`#bio-btn`)
    if(btn) btn.onclick = editBio;
});

// Render profile's bio as a textarea.
function editBio(e) {

  e.preventDefault();
  const content_div = document.querySelector(`#profile-bio`);

  // Transform bio into a textarea.
  content_div.innerHTML = `<textarea class="form-control" rows="${ content_div.offsetHeight / 25 }"> ${ content_div.innerText } </textarea>`;

  // render a button to save edited bio.
  document.querySelector(`#btn-div`).style.display ='block';
};

// Save edited bio or avatar.
function save(edit_avatar) {

  // Get avatar and bio div and profile's id.
  const content_div = document.querySelector(`#profile-bio`),
  avatar_div = document.querySelector(`#profile-avatar`),
  id = document.querySelector(`#profile-id`).innerText;


  // Request header
  // url is profile/profile_id
  const request = new Request(
    `/profile/${id}`,
    {headers: {'X-CSRFToken': csrftoken}}
  ),
  // body is either the new avatar or the new bio
  body = edit_avatar ? 
        {avatar: document.querySelector(`#avatar-url`).value} 
        : {bio: content_div.children[0].value}
      ;

  // Put new bio or avatar in profile.
  fetch(request, {
    method: 'PUT',
    mode: 'same-origin',
    body: JSON.stringify(body)
  }).then(response => response.json())
  .then(result => {
    if(!result.error) {
      // if no error occurred, render update information without reloading
      content_div.innerText =  result.bio;
      avatar_div.innerHTML = `<img id="profile-img" src="${result.avatar || '/static/calendarApp/profile.svg'}" alt="">`; 
      // Hide avatar modal in case avatar was edited
      $('#modal').modal('hide');
    }
    else {
      // if an error occurred, handle it.
      handleError(result.error);
    }
  }
  );
  document.querySelector(`#btn-div`).style.display ='none';
};


// Handle possible errors on fetching data.
// Display error message in #error-alert element
function handleError(message) {
  const tmp = document.querySelector('#error-alert')
  tmp.innerText = message;
  tmp.style.display = 'grid';
  tmp.addEventListener('click', () => {
    tmp.innerText = '';
    tmp.style.display = 'none';
  });
}
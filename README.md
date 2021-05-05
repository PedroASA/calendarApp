# Calendar App

## Project Description
The app is a simple calendar used to store events - much like [Google Calendar](https://calendar.google.com/).

There are two models:
 * #### Events
      Events have title, description, date, time, location _(optional)_, a host and a list of participants. _(Obs: A host is also a participant_).
 * #### Users
      Users have username, email, password, avatar _(optional)_ and bio _(optional)_.
   
### Users can:
  * create events;
  * view and leave events in which they participate;
  * add and delete participants from events they host;
  * delete events they host;
  * change their own bio and avatar.


### The app consists of three main pages:
 - #### Profile
   This page shows all information regarding a user's profile. If the user owns the profile, he may edit it and view next events in the month, otherwise he can view events in common with the profile's user.
 - #### Home
   This page aims to introduce newer users to the app's mechanics. It provides images with explanations in addition to this README file content.
 - #### Calendar
   This is the main page of the app. 
   Here users who are logged in can create, view, edit, delete and leave events by clicking on the wanted date on a calendar.
   
## Responsiviness
The app works well on any mobile, but it responds better to wider screens. Therefore, rotating the phone horizontally results in a better experience. Check the [demo](https://youtu.be/JFlMH_ygqOw). 
   
## Distinctiviness

This project is an attempt to combine a little bit of what was learned in each assignment.
 * From __Project0__: The URL GET parameters.
 * From __Project1__: The markdown to html conversion. 
 * From __Project2__: Storing images as url fields.
 * From __Project3__: Model serialization and Json responses.
 * From __Project4__: Back-end and front-end pagination.

### How does it differ from __Project4__:
 The app has very little user interactions to be considered a social network. It's main functionality is storing and organizing events whether they have other participants - other users - or not.
 
### How does it differ from __Project2__:
 The app does not resemble an e-commerce site in a meaningful way.

## Complexity

This project is more complex than the previous projects mainly because it's more dynamic. That is, it relies less on Django's template architecture and focus on responsiviness by using __JavaScript__ on the front-end and __JSON__ responses in the back-end. Additionaly, it implements topics discussed in the last lecture such as __caching__ and __API__ communication.

### HTML/CSS
 For a responsive design, the app uses various components from __Bootstrap5__. Additionaly, it has a lot of icons for a better user experience. And to reinforce a responsive behavior for small screens such as mobiles, a few media-queries were implemented.
 
### JavaScript
 To avoid page reloads and achieve better user interation, the app renders most of its information throught **JS** fetch requests. Moreover, it conditionally renders the calendar days based on the month. A particularlly different feature that was used in this project is the __HTTP DELETE__ method in the communication between the front-end and back-end.

### Django
 On the back-end that are mainly two things that differ from previous projects in complexity:
   - #### Requests to other APIs
      The app makes both __GET__ and __POST__ requests to the [GitHub REST Api](https://docs.github.com/en/rest).
      It gets this README file - [the publicly accessible gist version](https://gist.github.com/PedroASA/b9b41463dd24641adb782f5abf70f426) - and posts its markdown content to convert it to html. 
   - #### [Django's Cache Framework](https://docs.djangoproject.com/en/3.1/topics/cache/#the-low-level-cache-api)
      Since the aforementioned requests' content - this __README__ - shouldn't change very often, the content can be cached for 15 minutes to avoid making requests every time it is rendered. To accomplish that, the django's low level caching API was used, since the README content can be cached but not the entire view.


## Project Structure

* ### static/calendarApp
  - __styles.css__
    * **CSS** file responsable for styling every template.
  - __calendar.js__
    * **JS** file responsable for the front-end logic in the __calendar.html__ template
  - __profile.js__ 
    * **JS** file responsable for the front-end logic in the __calendar.html__ template
  - __profile.svg__
    * **SVG** file that stores the default avatar icon for users with no avatar.
  - __favicon.svg__
    * **SVG** file that stores the app icon that appears in the browser's tab.
* ### templates/calendarApp
  - __index.html__
    * Template that renders the Home page or an Event form.
  - __error.html__
    * Template that renders generic error messages.
  - __calendar.html__
    * Template that renders gthe Calendar page.
  - __layout.html__
    * Template that renders the head, the header and the footer of all templates.
  - __profile.html__
    * Template that renders the Profile page.
  - __login.html__
    * Template that renders the Login Form.
  - __register.html__
    * Template that renders the registration form.
* __urls.py__
  - **Python** file that stores all accepted urls for the __calendarApp__. 
* __views.py__
  - **Python** file that stores all views for the __calendarApp__. 
* __models.py__
  - **Python** file that stores all models for the __calendarApp__. 
* __admin.py__
  - **Python** file that designates what a __superuser__ is able to do. 



## Usage
### Install dependencies
  ```bash
  pip install -r requirements.txt 
  ```
  _The app should only require the [requests](https://pypi.org/project/requests/) library and the [datetime](https://docs.python.org/3/library/datetime.html) module._
### Manage migrations

 ```bash
 python manage.py makemigrations 
 python manage.py migrate 
 ```

### Running
```bash
python manage.py runserver 
```

## Site
https://pedroasa-calendar-app.herokuapp.com/

## Demo
[![Everything Is AWESOME](https://img.youtube.com/vi/StTqXEQ2l-Y/0.jpg)](https://www.youtube.com/watch?v=StTqXEQ2l-Y "Everything Is AWESOME")
